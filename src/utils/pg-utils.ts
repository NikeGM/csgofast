import { type PoolClient, type Pool } from 'pg'
import pgTx from '@onmoon/pg-tx'

export class PgUtils {
  constructor(private readonly db: Pool) {
  }

  public tx<T>(
    callback: (db: PoolClient) => Promise<T>,
  ): Promise<T> {
    return pgTx(this.db, callback)
  }
}