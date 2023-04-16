import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('snacks', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.text('description').notNullable()
    table.boolean('is_diet').notNullable()
    table.string('created_at').defaultTo(knex.fn.now()).notNullable()
    table.string('updated_at').defaultTo(knex.fn.now()).notNullable()
    table.uuid('user_id').notNullable()
    table.foreign('user_id').references('id')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('snacks')
}
