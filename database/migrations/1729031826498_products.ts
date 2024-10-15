import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  public up() {
    this.schema.alterTable('products', (table) => {
      table.float('valor')
    })
  }
}
