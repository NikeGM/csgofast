import fastify, { FastifyInstance, FastifyReply } from 'fastify';
import { ExternalApi } from 'src/external-api';
import { UserRepository } from 'src/user-repository';
import { buyItemOptions, getItemsOptions, getUserOptions, loginOptions } from 'src/api/schema';
import { BuyItemRequest, LoginRequest, RequestWithUser } from 'src/types';
import logger from 'src/utils/log';
import jwt from 'jsonwebtoken'

export class Api {
  private app: FastifyInstance;

  constructor(
    private readonly externalApi: ExternalApi,
    private readonly userRepository: UserRepository
  ) {

    this.authenticateJWT = this.authenticateJWT.bind(this);

    this.app = fastify({
      logger: true
    });

    const jwtOptions = {
      expiresIn: '1d'
    };

    // Endpoint for retrieving a list of items, with an additional field min_price_tradable.
    this.app.get('/items', {
      schema: getItemsOptions,
      preValidation: this.authenticateJWT
    }, async () => {
      return externalApi.getItemsList();
    });

    // Endpoint for retrieving a user and their transactions by id
    this.app.get<{ Params: { id: number } }>('/users/:id', {
      schema: getUserOptions,
      preValidation: this.authenticateJWT
    }, async (request, reply) => {
      const { id } = request.params;
      const user = await userRepository.getUserById(id);
      if (!user) reply.code(404).send({ message: 'User not found' });
      return user;
    });

    // Endpoint for purchasing an item.
    // Этот метод я бы закрыл через cloudflare или генерирывал отдельный токен для одминов или другого приложения
    this.app.post<{ Body: BuyItemRequest }>('/users/buy', {
        schema: buyItemOptions
      },
      async (request, reply) => {
        const { user_id: userId, price } = request.body;

        const user = await userRepository.getUserById(userId);

        if (!user) {
          reply.code(404).send({ success: false, message: 'User not found' });
          return;
        }

        if (user.balance < price) {
          reply.code(400).send({ success: false, message: 'Insufficient balance' });
          return;
        }

        await userRepository.buy(userId, price);

        reply.send({ success: true, message: 'Purchase successful' });
      });

    // Endpoint for receiving an authentication token
    this.app.post<{ Body: LoginRequest }>('/login', { schema: loginOptions }, async (request, reply) => {
      const { user_id, password } = request.body;

      const user = await this.userRepository.getUserById(user_id);
      if (!user) {
        reply.status(401).send({ message: 'Unknown user' });
        return;
      }

      const isPasswordValid = await this.userRepository.checkUserPassword(user_id, password);
      if (!isPasswordValid) {
        reply.status(401).send({ message: 'Invalid password' });
        return;
      }

      if (!process.env.JWT_SECRET) {
        logger.error(`JWT secret key not found.`)
        return;
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, jwtOptions);

      reply.send({ token });
    });

  }

  private async authenticateJWT(request: RequestWithUser, reply: FastifyReply) {
    try {
      const token = request.headers.authorization;
      console.log(request.headers)
      if (!token) {
        reply.status(401).send({ message: 'authentication token not found' });
        return;
      }

      if (!process.env.JWT_SECRET) {
        logger.error(`JWT secret key not found.`)
        return;
      }

      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      const user = await this.userRepository.getUserById(decoded.id);

      if (!user) {
        reply.status(500).send({ message: 'User token not found' });
        logger.error(`User not found. Id: ${decoded.id}`)
        return;
      }

      request.user = user;
    } catch (err) {
      logger.error(`Invalid authentication token, ${err}`)
      reply.status(401).send({ message: 'Invalid authentication token' });
    }
  };


  public start() {
    const port = +(process.env.API_PORT || 3000);
    this.app.listen({ port }, (err, address) => {
      if (err) {
        logger.error(`Error while running api. ${err.stack}`);
        process.exit(1);
      }
      logger.info(`Server is running on ${port}`);
    });
  }
}