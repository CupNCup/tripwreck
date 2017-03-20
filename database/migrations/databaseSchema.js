
exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTableIfNotExists('users', (table) => {
      table.increments('id').primary();
      table.string('auth_id')
        .unique()
        .nullable(false);
      table.integer('phone')
        .unique();
      table.string('language')
        .defaultTo('EN');
      table.timestamps();
    }),

    knex.schema.createTableIfNotExists('lists', (table) => {
      table.increments('id').primary();
      table.string('title')
        .defaultTo('New List')
        .nullable(false);
      table.text('description');
      table.integer('user_id')
        .references('id')
        .inTable('users')
        .nullable(false);
      table.string('user_name');
      table.string('city');
      table.timestamps();
    }),

    knex.schema.createTableIfNotExists('stores', (table) => {
      table.increments('id').primary();
      table.string('name')
        .nullable(false);
      table.integer('phone').unique();
      table.specificType('location', 'jsonb[]');
      table.specificType('address', 'jsonb[]');
      table.string('zomato_id').unique();
      table.string('thumb');
      table.integer('price');
      table.integer('type_id')
        .references('id')
        .inTable('types');
      table.timestamps();
    }),

    knex.schema.createTableIfNotExists('types', (table) => {
      table.increments('id').primary();
      table.string('name')
        .unique()
        .nullable(false);
    }),

    knex.schema.createTableIfNotExists('categories', (table) => {
      table.increments('id').primary();
      table.string('name')
        .unique()
        .nullable(false);
    }),

    knex.schema.createTableIfNotExists('shared_lists', (table) => {
      table.integer('user_id')
        .references('id')
        .inTable('users');
      table.integer('list_id')
        .references('id')
        .inTable('lists');
    }),

    knex.schema.createTableIfNotExists('lists_stores', (table) => {
      table.integer('list_id')
        .references('id')
        .inTable('lists');
      table.integer('store_id')
        .references('id')
        .inTable('stores');
    }),

    knex.schema.createTableIfNotExists('stores_categories', (table) => {
      table.integer('store_id')
        .references('id')
        .inTable('stores');
      table.integer('category_id')
        .references('id')
        .inTable('categories');
    })
  ])
      
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTableIfExists('users')
    .dropTableIfExists('lists')
    .dropTableIfExists('stores')
    .dropTableIfExists('types')
    .dropTableIfExists('categories')
    .dropTableIfExists('shared_lists')
    .dropTableIfExists('lists_stores')
    .dropTableIfExists('stores_categories');
};
