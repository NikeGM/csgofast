import { ExternalApi } from 'src/external-api';
import { UserRepository } from 'src/user-repository';
import pg, { type Pool } from 'pg'
import process from 'node:process';
import { PgUtils } from 'src/utils/pg-utils';
import { Api } from 'src/api/api';

export class Container {
  private _externalApi: ExternalApi | null = null;
  private _api: Api | null = null;
  private _userRepository: UserRepository | null = null;
  private _dbPool: Pool | null = null;
  private _pgUtils: PgUtils | null = null;

  get externalApi(): ExternalApi {
    if (!this._externalApi) {
      this._externalApi = new ExternalApi();
    }
    return this._externalApi;
  }

  get api(): Api {
    if (!this._api) {
      this._api = new Api(this.externalApi, this.userRepository);
    }
    return this._api;
  }

  get dbPool(): Pool {
    if (!this._dbPool) {
      if (!process.env.POSTGRES_URL) {
        throw new Error('POSTGRES_URL env is not set')
      }
      this._dbPool = new pg.Pool({
        connectionString: process.env.POSTGRES_URL,
        max: 50,
        allowExitOnIdle: true,
      })
    }
    return this._dbPool;
  }

  get pgUtils(): PgUtils {
    if (!this._pgUtils) {
      this._pgUtils = new PgUtils(this.dbPool)
    }
    return this._pgUtils;
  }

  get userRepository(): UserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(this.pgUtils);
    }
    return this._userRepository;
  }
}