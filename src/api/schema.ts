import { FastifySchema, RouteShorthandOptions } from 'fastify';

export const buyItemOptions: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      user_id: { type: 'integer' },
      price: { type: 'number' }
    },
    required: ['user_id', 'price']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  }
};

export const getUserOptions: FastifySchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'integer' }
    },
    required: ['id']
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        balance: { type: 'number' },
        transactions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              user_id: { type: 'integer' },
              action: { type: 'string' },
              amount: { type: 'number' },
              ts: { type: 'number' }
            }
          }
        }
      }
    }
  }
};

export const getItemsOptions: FastifySchema = {
  response: {
    200: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          market_hash_name: { type: 'string' },
          currency: { type: 'string' },
          suggested_price: { type: 'number' },
          item_page: { type: 'string' },
          market_page: { type: 'string' },
          min_price: { type: 'number' },
          min_price_tradable: { type: 'number' },
          max_price: { type: 'number' },
          mean_price: { type: 'number' },
          quantity: { type: 'number' },
          created_at: { type: 'number' },
          updated_at: { type: 'number' }
        }
      }
    }
  }
};
export const loginOptions: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      user_id: { type: 'number' },
      password: { type: 'string' }
    },
    required: ['user_id', 'password']
  }
};
