import { PgUtils } from 'src/utils/pg-utils';
import { User } from 'src/types';

export class UserRepository {
  constructor(private readonly dbClient: PgUtils) {
  }

  public async getUserById(id: number): Promise<User | null> {
    return Promise.resolve(null);
  }

  public async buy(userId: number, itemName: string, price: number) {

  }

}