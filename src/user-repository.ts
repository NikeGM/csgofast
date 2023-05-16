import { PgUtils } from 'src/utils/pg-utils';
import { Action, Transaction, User } from 'src/types';
import { PoolClient } from 'pg';
import logger from 'src/utils/log';

enum Tables {
  USERS = 'users',
  USERS_TXS = 'users_transactions'
}

export class UserRepository {
  constructor(private readonly pgUtils: PgUtils) {
  }

  public async getUserById(id: number): Promise<User | null> {
    try {
      const user = await this.pgUtils.query<User>(async (client: PoolClient) => {
        const query = `SELECT user_id, balance FROM ${Tables.USERS} WHERE user_id = $1`;
        const values = [id];

        const result = await client.query(query, values);

        return result.rows[0];
      });

      const txs = await this.pgUtils.query<Transaction[]>(async (client: PoolClient) => {
        const query = `SELECT transaction_id, user_id, amount, action, timestamp as ts
                       FROM ${Tables.USERS_TXS}
                     WHERE user_id = $1`;
        const values = [id];

        const result = await client.query(query, values);

        return result.rows;
      });

      return {
        ...user,
        transactions: txs
      };
    } catch (e) {
      logger.error(`Error while requesting user ${e}`);
      return null;
    }
  }

  public async buy(userId: number, price: number) {
    return this.pgUtils.tx(async (client: PoolClient) => {
      try {
        const txQuery = 'INSERT INTO users_transactions (user_id, amount, action) VALUES ($1, $2, $3)';
        const txValues = [userId, price, Action.BUY];
        await client.query(txQuery, txValues);

        const balanceQuery = `
        UPDATE ${Tables.USERS}
        SET balance = (
          SELECT COALESCE(SUM(CASE WHEN action = 0 THEN amount ELSE -amount END), 0)
          FROM ${Tables.USERS_TXS}
          WHERE ${Tables.USERS_TXS}.user_id = ${Tables.USERS}.user_id
        )
        WHERE user_id = $1
      `;
        return client.query(balanceQuery, [userId]);
      } catch (e) {
        logger.error(`Error while buy item ${e}`);
      }
    });
  }

}