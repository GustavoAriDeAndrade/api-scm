import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Group from 'App/Models/Group';
import User from 'App/Models/User';
import CreateUserValidator from 'App/Validators/CreateUserValidator';

/**
 * Controller dos usuários
 */
export default class UsersController {

	/**
	 * Função para criação de um novo usuário
	 * @param param0 
	 * @returns 
	 */
	public async create({ request, response } : HttpContextContract){

		await request.validate(CreateUserValidator)

		const trx = await Database.transaction()

		try{

			const body = request.only([ 'nome', 'email', 'password', 'ativo' ])

			const grupo_id = request.input('grupo')

			const grupo = await Group.query().where('id', grupo_id).first()

			const user = new User()

			user.useTransaction(trx)

			user.merge(body)
				
			grupo && await user.related('group').associate(grupo)

			await user.save()

			await trx.commit()

			return response.created({ message: 'Usuário criado com sucesso.', user })

		}catch(e){

			console.log(e)

			await trx.rollback()

			return response.internalServerError({ message: e.message })

		}
	}

	/**
	 * Realiza a listagem dos usuários cadastrados 
	 * @param param0 
	 * @returns 
	 */
	public async read({ group, request, response } : HttpContextContract){

		const { page, limit, orderBy, order, search, _embed } = request.all()

		if(!group){

			throw { message: 'Usuário sem grupo' }

		}

		let query = User.query()

		if(query != null){

			if(search){

				query.whereRaw('(nome ilike ? or email ilike ?)', [ `%${search}%`, `%${search}%` ])

			}

			if(orderBy){

				query.orderBy(orderBy, order)

			}

			query.preload('group', (queryGroup) => {
				queryGroup.select('id', 'nome')
			})

			if(_embed === 'true'){

				const users = await query

				return response.status(200).send({ users })

			}

			const users = await query.paginate(page, limit)

			return response.status(200).send({ users })

		}
	}

	/**
	 * Função para realizar a atualização de um usuário
	 * @param param0 
	 * @returns 
	 */
	public async update({ request, response, params } : HttpContextContract){

		await request.validate(CreateUserValidator)

		const trx = await Database.transaction()

		try{

			const body = request.only([ 'nome', 'email', 'password', 'ativo' ])

			const grupo_id = request.input('grupo')

			const password = request.input('password')

			const grupo = await Group.query().where('id', grupo_id).first()

			const user = await User.query().where('id', params.id).first()

			if(user){

				if(password){
	
					user.password = password
	
				}

				user.useTransaction(trx)
	
				user.merge(body)
	
				grupo && await user.related('group').associate(grupo)
	
				await user.save()
	
				await trx.commit()
	
				return response.ok({ message: 'Usuário atualizado com sucesso.', user })
			
			}else{

				return response.status(204).send({ message: 'Usuário não encontrado' })

			}

		}catch(e){

			console.log(e)

			await trx.rollback()

			return response.internalServerError({ message: e.message })

		}
	}

	/**
	 * Busca um usuário com base no seu id
	 * @param param0 
	 * @returns 
	 */
	public async find({ group, params, response } : HttpContextContract){

		const user = await User.query().where('id', params.id).preload('group', (queryGroup) => {
			queryGroup.select('id', 'nome')
		}).first()

		if(!user){

			return response.status(204).send({ message: 'Usuário não encontrado'})

		}else if(group?.chave !== 'admin' && user.grupo_id != group?.id){

			return response.status(401).send({ message: 'Você não pode acessar esse usuário'})

		}

		return response.status(200).send({ user })

	}

	/**
	 * Realiza o login do usuário
	 * @param param0 
	 * @returns 
	 */
	public async login ({ auth, request, response } : HttpContextContract){

		try{

			const { email, password } = request.only([ 'email', 'password' ]);

			const authenticated = await auth.attempt(email, password)

			await auth.user?.load('group')

			return response.ok({ authenticated, user: auth.user })

		}catch(e){

			console.log(e)

			return response.notFound({ message: e.message })

		}
	}

	/**
	 * Retorna os dados do usuário logado
	 * @param payload
	 * @returns 
	 */
	public async me({ auth } : HttpContextContract) {
		
		await auth.user?.load('group')

		return auth.user

	}

	/**
	 * Realiza a listagem dos grupos cadastrados
	 * @param param0 
	 * @returns 
	 */
	public async readGroups({ auth, request } : HttpContextContract) {

		const { page, limit, orderBy, order, search, _embed } = request.all()

		const group = await auth.user?.related('group').query().first()
		
		const query = Group.query()
		
		if(group){

			query.where('hierarquia', '>=', group.hierarquia)

		}
		
		if(search) {

			query.whereRaw('nome ilike ?', [ `%${search}%` ])

		}
		
		if(orderBy) {
			
			query.orderBy(orderBy, order);
		}
		
		if(_embed) {

			const user_groups = await query
			
			return { user_groups }

		}
		
		const user_groups = await query.paginate(page, limit)
		
		return user_groups

	}

	/**
	 * Busca os grupos cadastrados para select
	 * @param param0 
	 * @returns 
	 */
	public async getGroups({ response, group } : HttpContextContract){

		if(group){
		
			const grupos = await Group.query().select('id', 'nome').where('hierarquia', '>=', group.hierarquia)
	
			return response.status(200).send({ grupos })
		
		}
		
	}
}
