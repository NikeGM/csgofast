import fastify, { FastifyInstance } from 'fastify';
import { ExternalApi } from 'src/external-api';
import { UserRepository } from 'src/user-repository';
import { buyItemOptions, getItemsOptions, getUserOptions } from 'src/api/schema';
import { BuyItemRequest } from 'src/types';
import logger from 'src/utils/log';

export class Api {
  private app: FastifyInstance;

  constructor(
    private readonly externalApi: ExternalApi,
    private readonly userRepository: UserRepository
  ) {
    this.app = fastify({
      logger: true
    });

    // Endpoint for retrieving a list of items, with an additional field min_price_tradable.
    this.app.get('/items', getItemsOptions, async () => {
      return externalApi.getItemsList();
    });

    // Endpoint for retrieving a user and their transactions by id
    this.app.get<{ Params: { id: number } }>('/users/:id', getUserOptions, async (request, reply) => {
      const { id } = request.params;
      const user = await userRepository.getUserById(id);
      if (!user) reply.code(404).send({ message: 'User not found' });
      return user;
    });

    // Endpoint for purchasing an item.
    this.app.post<{ Body: BuyItemRequest }>('/users/buy', buyItemOptions, async (request, reply) => {
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

  }

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