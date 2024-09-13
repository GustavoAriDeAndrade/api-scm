import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Client from './Client'
import SaleProduct from './SaleProduct'

export default class Sale extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public usuario_id: number

  @column()
  public cliente_id: number

  @column()
  public valor_total: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'usuario_id' })
  public user: BelongsTo<typeof User>

  @belongsTo(() => Client, { foreignKey: 'cliente_id' })
  public client: BelongsTo<typeof Client>

  @hasMany(() => SaleProduct, { foreignKey: 'venda_id' })
  public products: HasMany<typeof SaleProduct>
}
