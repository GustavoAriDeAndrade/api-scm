import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'sale_payments'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('venda_id')
      table.integer('parcela')
      table.float('valor')
      table.float('valor_restante')
      table.boolean('paga').defaultTo(false)
      table.timestamp('data_pagamento')
      table.timestamp('data_vencimento')
      table.integer('metodo_pagamento_id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
