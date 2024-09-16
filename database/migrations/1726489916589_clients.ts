import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'clients'

  public up() {
    this.schema.alterTable('clients', (table) => {
      table.boolean('ativo').defaultTo(true)
    })
  }
}
