exports.up = async (knex) => {
  await knex.schema.createTable('users', (table) => {
    table.increments('user_id').primary();
    table.integer('balance');
    table.string('password_hash');
  });
  await knex.schema.createTable('users_transactions', (table) => {
    table.increments('transaction_id').primary();
    table.integer('user_id');
    table.integer('action');
    table.integer('amount');
    table.timestamp('timestamp').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    table.foreign('user_id').references('users.user_id');
  });

  await knex.table('users_transactions').insert({ user_id: 1, amount: 100, action: 0 });
  await knex.table('users_transactions').insert({ user_id: 1, amount: 100, action: 0 });
  await knex.table('users_transactions').insert({ user_id: 1, amount: 100, action: 0 });
  await knex.table('users').insert({ user_id: 1, balance: 300, password_hash: '$2b$10$vByZ76K9nuzlZtM.NZT2du7xVCf1ua8EVve8J2YofPiw2RmT.AnqK' });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('users_transactions');
  await knex.schema.dropTable('users');
};
