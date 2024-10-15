import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Product from 'App/Models/Product'
import CreateProductValidator from 'App/Validators/CreateProductValidator'

/**
 * Controller dos produtos
 */
export default class ProductsController {

	/**
	 * Função para criação de um novo produto
	 * @param param0 
	 * @returns 
	 */
	public async create({ request, response } : HttpContextContract){

		await request.validate(CreateProductValidator)

		const trx = await Database.transaction()

		try{

			const body = request.only([ 'nome', 'ativo', 'valor' ])

			const product = new Product()

			product.useTransaction(trx)

			product.merge(body)

			await product.save()

			await trx.commit()

			return response.created({ message: 'Produto criado com sucesso.', product })

		}catch(e){

			console.log(e)

			await trx.rollback()

			return response.internalServerError({ message: e.message })

		}
	}

	/**
	 * Realiza a listagem dos produtos cadastrados 
	 * @param param0 
	 * @returns 
	 */
	public async read({ group, request, response } : HttpContextContract){

		const { page, limit, orderBy, order, search, _embed } = request.all()

		if(!group){

			throw { message: 'Usuário sem grupo' }

		}

		let query = Product.query()

		if(query != null){

			if(search){

				query.whereILike('nome', '%' + search + '%')

			}

			if(orderBy){

				query.orderBy(orderBy, order)

			}

			if(_embed === 'true'){

				let products = await query

				products = await this.formatValue(products)

				return response.status(200).send({ products })

			}

			const products = await query.paginate(page, limit)

			return response.status(200).send({ products })

		}
	}

	/**
	 * Função para realizar a atualização de um produto
	 * @param param0 
	 * @returns 
	 */
	public async update({ request, response, params } : HttpContextContract){

		await request.validate(CreateProductValidator)

		const trx = await Database.transaction()

		try{

			const body = request.only([ 'nome', 'ativo', 'valor' ])

			const product = await Product.query().where('id', params.id).first()

			if(product){

				product.useTransaction(trx)
	
				product.merge(body)
	
				await product.save()
	
				await trx.commit()
	
				return response.ok({ message: 'Produto atualizado com sucesso.', product })
			
			}else{

				return response.status(204).send({ message: 'Produto não encontrado' })

			}

		}catch(e){

			console.log(e)

			await trx.rollback()

			return response.internalServerError({ message: e.message })

		}
	}

	/**
	 * Busca um produto com base no seu id
	 * @param param0 
	 * @returns 
	 */
	public async find({ params, response } : HttpContextContract){

		const product = await Product.query().where('id', params.id).first()

		if(!product){

			return response.status(204).send({ message: 'Produto não encontrado'})

		}

		return response.status(200).send({ product })

	}

	/**
	 * Busca os produtos cadastrados para listar no select
	 * @param param0 
	 * @returns 
	 */
	public async select({ response } : HttpContextContract){

		const products = await Product.query().select('id', 'nome').where('ativo', true).orderBy('nome')

		return response.status(200).send({ products })

	}

	/**
	 * Função para formatar o valor dos produtos 
	 * @param produtos 
	 * @returns 
	 */
	private async formatValue(produtos){
		// percorremos os produtos
		for(let i = 0; i < produtos.length; i++){
			// atribuimos o produto atual
			const produto = produtos[i]
			// converte o valor para float mantendo duas casas decimais
			let valor_formatado = parseFloat(produto.valor).toFixed(2)
			// converte a vírgula em ponto, caso exista
			valor_formatado = valor_formatado.toString().replace('.', ',')
			// atribui o valor ao array
			produtos[i].valor = valor_formatado
		}
		// retorna o array com os valores formatados
		return produtos
	}
}
