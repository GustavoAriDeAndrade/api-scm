import { DateTime } from 'luxon'
import { BaseModel, beforeSave, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Group from './Group'
import Hash from '@ioc:Adonis/Core/Hash'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string

  @column()
  public email: string

  @column()
  public grupo_id: number

  @column({ serializeAs: null })
  public password: string

  @column()
  public ativo: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Group, { foreignKey: 'grupo_id' })
  public group: BelongsTo<typeof Group>

  /**
   * Transforma a senha em hash
   * @param user 
   */
  @beforeSave()
  public static async hashPassword(user: User) {

    if(user.$dirty.password && user.$dirty.password != 'notlogin') {
      user.password = await Hash.make(String(user.password));
    }
  }
}
