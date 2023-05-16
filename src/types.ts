export interface ItemInput {
  market_hash_name: string;
  currency: string;
  suggested_price: number;
  item_page: string;
  market_page: string;
  min_price: number;
  max_price: number;
  mean_price: number;
  quantity: number;
  created_at: number;
  updated_at: number;
}

export interface Item extends ItemInput {
  min_price_tradable: number | null;
}

export interface Transaction {
  user_id: number;
  action: Action;
  amount: number;
  ts: number;
}

export interface User {
  id: number;
  balance: number;
  transactions: Transaction[];
}

export interface BuyItemRequest {
  market_hash_name: string;
  user_id: number;
  price: number;
}

export enum Tradable {
  NOT_TRADABLE = 0,
  TRADABLE = 1
}

export enum Action {
  SELL = 0,
  BUY = 1
}