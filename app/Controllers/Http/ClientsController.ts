import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Client from 'App/Models/Client';
import CreateClientValidator from 'App/Validators/CreateClientValidator';

/**
 * Controller dos clientes
 */
export default class ClientsController {

	/**
	 * Função para criação de um novo cliente
	 * @param param0 
	 * @returns 
	 */
	public async create({ request, response } : HttpContextContract){

		await request.validate(CreateClientValidator)

		const trx = await Database.transaction()

		try{

			const body = request.only([ 'nome', 'telefone', 'email', 'observacao', 'rua', 'numero' ])

			const client = new Client()

			client.useTransaction(trx)

			client.merge(body)

			await client.save()

			await trx.commit()

			const cliente = {
				id: client.id,
				nome: client.nome
			}

			return response.created({ message: 'Cliente criado com sucesso.', cliente })

		}catch(e){

			console.log(e)

			await trx.rollback()

			return response.internalServerError({ message: e.message })

		}
	}

	/**
	 * Realiza a listagem dos clientes cadastrados 
	 * @param param0 
	 * @returns 
	 */
	public async read({ group, request, response } : HttpContextContract){

		const { page, limit, orderBy, order, search, _embed } = request.all()

		if(!group){

			throw { message: 'Cliente sem grupo' }

		}

		let query = Client.query()

		if(query != null){

			if(search){

				query.whereRaw('(nome ilike ? or email ilike ?)', [ `%${search}%`, `%${search}%` ])

			}

			if(orderBy){

				query.orderBy(orderBy, order)

			}

			if(_embed === 'true'){

				const clients = await query

				return response.status(200).send({ clients })

			}

			const clients = await query.paginate(page, limit)

			return response.status(200).send({ clients })

		}
	}

	/**
	 * Função para realizar a atualização de um cliente
	 * @param param0 
	 * @returns 
	 */
	public async update({ request, response, params } : HttpContextContract){

		await request.validate(CreateClientValidator)

		const trx = await Database.transaction()

		try{

			const body = request.only([ 'nome', 'telefone', 'email', 'observacao', 'rua', 'numero' ])

			const client = await Client.query().where('id', params.id).first()

			if(client){

				client.useTransaction(trx)
	
				client.merge(body)
	
				await client.save()
	
				await trx.commit()
	
				return response.ok({ message: 'Cliente atualizado com sucesso.', client })
			
			}else{

				return response.status(204).send({ message: 'Cliente não encontrado' })

			}

		}catch(e){

			console.log(e)

			await trx.rollback()

			return response.internalServerError({ message: e.message })

		}
	}

	/**
	 * Busca um cliente com base no seu id
	 * @param param0 
	 * @returns 
	 */
	public async find({ params, response } : HttpContextContract){

		const client = await Client.query().where('id', params.id).first()

		if(!client){

			return response.status(204).send({ message: 'Cliente não encontrado'})

		}

		return response.status(200).send({ client })

	}

	/**
	 * Busca os clientes cadastrados para listar no select
	 * @param param0 
	 * @returns 
	 */
	public async select({ response } : HttpContextContract){

		const clients = await Client.query().select('id', 'nome').orderBy('nome')

		return response.status(200).send({ clients })

	}
}
