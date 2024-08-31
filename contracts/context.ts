/**
 * Extende o módulo de contexto
 */
declare module '@ioc:Adonis/Core/HttpContext' {
	// importa a model do grupo do usuário
	import Group from "App/Models/Group"

	/**
	 * Define a interface do contrato
	 */
	interface HttpContextContract {
		// adiciona uma propriedado adicional do grupo do usuário
		group: 	Group | null | undefined,
	}
}