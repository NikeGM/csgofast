exports.up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.increments('user_id').primary();
    table.integer('balance');
    table.string('password_hash');
  });
  await knex.schema.createTable('users_transactions', (table) => {
    table.increments('transaction_id').primary();
    table.integer('user_id');
    table.string('action');
    table.integer('amount');
    table.timestamp('timestamp');
    table.foreign('user_id').references('users.user_id');
  });
  await knex.table('users').insert({ user_id: 1, balance: 500, password_hash: '' });
  await knex.table('users_transactions').insert({ user_id: 1, amount: 100, action: 'buy' });
  await knex.table('users_transactions').insert({ user_id: 1, amount: 100, action: 'buy' });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('users_transactions');
  await knex.schema.dropTable('users');
};
