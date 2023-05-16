import { Item, ItemInput, Tradable } from 'src/types';
import axios, { AxiosResponse } from 'axios';
import NodeCache from 'node-cache';
import logger from 'src/utils/log';

export class ExternalApi {
  private cache = new NodeCache();
  private key = 'items';

  constructor() {
  }

  public async getItemsList(): Promise<Item[]> {
    let items = this.cache.get<Item[]>(this.key);
    if (items == undefined) {
      logger.info(`Data for param ${this.key} not found in cache`);
      items = await this.getMergedItems();
      this.cache.set(this.key, items, +(process.env.CACHE_EXPIRATION_TIMEOUT || 3600));
    } else {
      logger.info(`Data for param ${this.key} found in cache`);
    }
    return items;
  }

  public clearCache() {
    this.cache.del(this.key);
  }

  private async getMergedItems() {
    const items = await this.getItemsFromExternalApi(Tradable.NOT_TRADABLE);
    const itemsTradable = await this.getItemsFromExternalApi(Tradable.TRADABLE);
    return this.mergeItems(items, itemsTradable);
  }

  private async getItemsFromExternalApi(tradable: Tradable): Promise<ItemInput[]> {
    try {
      if (!process.env.EXTERNAL_API_URL) {
        logger.error('External api url is undefined');
        return [];
      }
      const response: AxiosResponse<ItemInput[]> = await axios.get(process.env.EXTERNAL_API_URL, {
        params: {
          tradable
        }
      });

      return response.data
    } catch (error) {
      logger.error(`Error requesting external api ${error}`);
      return [];
    }
  }

  private mergeItems(items: ItemInput[], itemsTradable: ItemInput[]): Item[] {
    const hashMap: { [key: string]: ItemInput } = {};

    for (const item of itemsTradable) {
      if (item.market_hash_name) {
        hashMap[item.market_hash_name] = item;
      }
    }

    const mergedArray: Item[] = [];

    for (const item of items) {
      const mergedItem: Item = {
        ...item,
        min_price_tradable: hashMap[item.market_hash_name]?.min_price ?? null
      };
      mergedArray.push(mergedItem);
    }

    return mergedArray;
  }

}



