import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateSaleValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string([ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string([
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
		usuario_id: schema.string({}, [
			rules.exists({ table: 'users', column: 'id' })
		]),
		cliente_id: schema.string({}, [
			rules.exists({ table: 'clients', column: 'id' })
		]),
    produtos: schema.array().members(
      schema.object().members({
        produto_id: schema.string(),
        nome: schema.string(),
        quantidade: schema.number(),
        valor: schema.number(),
      })
    ),
    valor_total: schema.number(),
    valor_entrada: schema.number.optional(),
    forma_pagamento_id: schema.string.optional({}, [
			rules.exists({ table: 'type_payments', column: 'id' })
		]),
    quantidade_parcelas: schema.number(),
    valor_parcelas: schema.number(),
    data_parcela: schema.date()
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {}
}
