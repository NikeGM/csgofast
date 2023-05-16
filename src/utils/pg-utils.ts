import { type PoolClient, type Pool } from 'pg';
import pgTx from '@onmoon/pg-tx';

export class PgUtils {
  constructor(private readonly pool: Pool) {
  }

  public query<T>(callback: (poolClient: PoolClient) => Promise<T>): Promise<T> {
    return new Promise((res, rej) => {
      this.pool.connect(async (err: Error, client: PoolClient, release: () => void) => {
        if (err) {
          console.error('Error acquiring client from pool', err);
          rej(err);
          return;
        }
        const result = await callback(client);
        release();
        res(result);
      });
    });

  }

  public tx<T>(
    callback: (db: PoolClient) => Promise<T>
  ): Promise<T> {
    return pgTx(this.pool, callback);
  }
}