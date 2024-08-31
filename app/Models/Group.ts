import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Group extends BaseModel {
  public static table = 'groups'

  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public chave: string

  @column()
  public hierarquia: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
