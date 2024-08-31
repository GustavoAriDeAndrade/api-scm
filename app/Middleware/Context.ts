import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Context {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {

    ctx.group = await ctx.auth.user?.related('group').query().first()

    // code for middleware goes here. ABOVE THE NEXT CALL
    await next()
  }
}
