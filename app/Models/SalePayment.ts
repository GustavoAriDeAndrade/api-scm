import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import TypePayment from './TypePayment'
import Sale from './Sale'

export default class SalePayment extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public venda_id: number

  @column()
  public parcela: number

  @column()
  public valor: number

  @column()
  public valor_restante: number

  @column()
  public paga: boolean

  @column()
  public data_pagamento: string | null

  @column()
  public data_vencimento: string

  @column()
  public metodo_pagamento_id: number | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Sale, { foreignKey: 'venda_id' })
  public sale: BelongsTo<typeof Sale>

  @belongsTo(() => TypePayment, { foreignKey: 'metodo_pagamento_id' })
  public type: BelongsTo<typeof TypePayment>
}
