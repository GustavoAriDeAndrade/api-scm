import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Product from './Product'

export default class SaleProduct extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public venda_id: number

  @column()
  public produto_id: number

  @column()
  public valor_unidade: number

  @column()
  public quantidade: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Product, { foreignKey: 'produto_id' })
  public product: BelongsTo<typeof Product>
}
