import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import TypePayment from 'App/Models/TypePayment'

export default class extends BaseSchema {
  protected tableName = 'type_payments'

  public async up () {

    await TypePayment.create({
      nome: 'Dinheiro',
      chave: 'dinheiro'
    })

    await TypePayment.create({
      nome: 'Cartão de Crédito',
      chave: 'credito'
    })

    await TypePayment.create({
      nome: 'Cartão de Débito',
      chave: 'debito'
    })

    await TypePayment.create({
      nome: 'Pix',
      chave: 'pix'
    })

    await TypePayment.create({
      nome: 'Crediário',
      chave: 'crediario'
    })
  }

  public async down () {
  }
}
