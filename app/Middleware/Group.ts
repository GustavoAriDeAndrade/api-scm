import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Middleware que valida o grupo para a rota
 */
export default class Group {
  /**
   * Valida o grupo
   * @param payload
   * @param next 
   * @param allowed 
   */
  public async handle ({ group, response }: HttpContextContract, next: () => Promise<void>, allowed: Array<String>) {
    // se não estiver autorizado, termina a execução
    if(!allowed.includes(group?.chave ?? '')) {
      // retorna que não tem permissão
      return response.status(401).send({ message: 'Você não tem permissão para acessar esta rota.' });
    }
    // code for middleware goes here. ABOVE THE NEXT CALL
    await next();
  }
}