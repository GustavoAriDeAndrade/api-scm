import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Group from 'App/Models/Group'

export default class extends BaseSchema {
  protected tableName = 'groups'

  public async up () {

    await Group.create({
      nome: 'Administrador',
      hierarquia: 1,
      chave: 'admin'
    })

    await Group.create({
      nome: 'Caixa',
      hierarquia: 2,
      chave: 'caixa'
    })
  }

  public async down () {
  }
}
