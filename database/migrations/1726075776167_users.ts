import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import User from 'App/Models/User'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {

    await User.create({
      nome: 'Administrador',
      email: 'admin@scm.com.br',
      grupo_id: 1,
      password: 'admin',
      ativo: true
    })
  }

  public async down () {
  }
}
