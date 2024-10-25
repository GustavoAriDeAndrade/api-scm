import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Sale from 'App/Models/Sale'
import SalePayment from 'App/Models/SalePayment'
import SaleProduct from 'App/Models/SaleProduct'
import TypePayment from 'App/Models/TypePayment'
import CreateSaleValidator from 'App/Validators/CreateSaleValidator'
import moment from 'moment'

/**
 * Controller para gerenciar as vendas 
 */
export default class SalesController {

    /**
     * Função para salvar uma venda
     * @param param0 
     * @returns 
     */
    public async create({ request, response } : HttpContextContract){

        await request.validate(CreateSaleValidator)

		const trx = await Database.transaction()

        try{

            const venda = request.only([ 'cliente_id', 'usuario_id', 'valor_total' ])

            const produtos = request.input('produtos')
            
            const pagamento = request.only([ 'valor_total', 'valor_entrada', 'forma_pagamento_id', 'quantidade_parcelas', 'valor_parcelas', 'data_parcela' ])

            const sale = new Sale()

			sale.useTransaction(trx)

			sale.merge(venda)

			await sale.save()

            this.saleProducts(produtos, sale.id)

            this.salePayments(pagamento, sale.id)

			await trx.commit()

			return response.created({ message: 'Venda cadastrada com sucesso.', sale })

        }catch(e){

			console.log(e)

			await trx.rollback()

			return response.internalServerError({ message: e.message })

		}
    }

	/**
	 * Realiza a listagem das vendas feitas
	 * @param param0 
	 * @returns 
	 */
	public async read({ request, response } : HttpContextContract){

		const { page, limit, orderBy, order, search, _embed, cliente_id, status } = request.all()

		let query = Sale.query()

		if(query != null){

            if(cliente_id){

                query.where('cliente_id', cliente_id)

            }

			if(orderBy){

				query.orderBy(orderBy, order)

			}

			query.preload('client', (queryClient) => {
				queryClient.select('id', 'nome')
			}).if(search, (clientQuery) => {
                clientQuery.whereHas('client', (filter) => {
                    filter.whereILike('nome', '%' + search + '%')
                })
            })

            query.preload('payments', (queryPayment) => {
                queryPayment.select('venda_id', 'paga', 'valor_restante', 'data_vencimento')
                    .where('paga', false)
                    .orderBy('data_vencimento', 'asc');
            })

            if(status){

                query.whereHas('payments', (filter) => {
                    filter.whereNotExists(
                        Database.from('sale_payments')
                            .whereColumn('sales.id', 'venda_id')
                            .where('paga', false)
                    )
                })

            }else{

                query.whereHas('payments', (filter) => {
                    filter.where('paga', false)
                })

            }

			if(_embed === 'true'){

				let sales = await query

				sales = await this.formatValue(sales)

				return response.status(200).send({ sales })

			}

			const sales = await query.paginate(page, limit)

			return response.status(200).send({ sales })

		}
	}

    /**
	 * Função para realizar a atualização de uma parcela
	 * @param param0 
	 * @returns 
	 */
	public async update({ request, response, params } : HttpContextContract){

		const trx = await Database.transaction()

		try{

			const body = request.all()

			const sale = await SalePayment.query().where({'id': params.id, 'venda_id': body.venda_id}).first()

			if(sale){

				sale.useTransaction(trx)
	
				sale.merge(body)
	
				await sale.save()
	
				await trx.commit()
	
				return response.ok({ message: 'Parcela atualizada com sucesso.', sale })
			
			}else{

				return response.status(204).send({ message: 'Parcela não encontrada' })

			}

		}catch(e){

			console.log(e)

			await trx.rollback()

			return response.internalServerError({ message: e.message })

		}
	}
    
    /**
	 * Busca uma venda com base no seu id
	 * @param param0 
	 * @returns 
	 */
	public async find({ params, response } : HttpContextContract){

		const sale = await Sale.query().where('id', params.id).preload('client', (queryClient) => {
			queryClient.select('id', 'nome')
		}).preload('user', (queryUser) => {
			queryUser.select('id', 'nome')
		}).preload('products', (queryProduct) => {
			queryProduct.preload('product')
		}).preload('payments').first()

		if(!sale){

			return response.status(204).send({ message: 'Venda não encontrada'})

		}

		return response.status(200).send({ sale })

	}

    /**
     * Busca as formas de pagamento cadastradas para listar no select
     * @param param0 
     * @returns 
     */
    public async select({ response } : HttpContextContract){

        const types = await TypePayment.query().select('id', 'nome').orderBy('nome')

		return response.status(200).send({ types })

    }

    /**
     * Busca as parcelas pendentes de pagamento de um cliente
     * @param param0 
     * @returns 
     */
    public async salesClient({ response, params } : HttpContextContract){
        
        try{

            const sale = await Sale.query().where('cliente_id', params.id)
                .preload('client', (queryClient) => {
                    queryClient.select('id', 'nome')
                })
                .preload('payments', (queryPayment) => {
                    queryPayment.select('venda_id', 'paga', 'valor_restante')
                })
                .whereHas('payments', (filter) => {
                    filter.where('paga', false)
                })

            if(sale){

                const sales = await this.formatPayments(sale) 

                return response.status(200).send({ sales: sales })

            }else{

                return response.status(200).send({ message: 'Não há pagamentos pendentes' })

            }

        }catch(e){

			console.log(e)

			return response.internalServerError({ message: e.message })

        }
    }

    /**
     * Marca uma compra como quitada
     * @param param0 
     * @returns 
     */
    public async quitarCompra({ response, params } : HttpContextContract){

        try{

            const payment = await SalePayment.query().where('venda_id', params.id).update({
                valor_restante: 0.00,
                paga: true,
                data_pagamento: moment().format('YYYY-MM-DD HH:mm:ss')
            })

            if(payment){

                return response.status(200).send({ message: 'Compra quitada com sucesso' })

            }else{

                return response.status(204).send({ message: 'Não foi possível quitar a compra' })

            }

        }catch(e){

			console.log(e)

			return response.internalServerError({ message: e.message })

        }
    }

    /**
     * Salva os produtos da venda
     * @param produtos 
     * @param venda_id 
     */
    private async saleProducts(produtos, venda_id){

        for(let i = 0; i < produtos.length; i++){

            await SaleProduct.create({
                venda_id: venda_id,
                produto_id: produtos[i].produto_id,
                valor_unidade: produtos[i].valor,
                quantidade: produtos[i].quantidade
            })
        }
    }
    
    /**
     * Salva os dados de pagamento da venda
     * @param pagamentos 
     * @param venda_id 
     */
    private async salePayments(pagamento, venda_id){

        if(pagamento.valor_total != pagamento.valor_entrada){

            let parcelas = 1

            if(pagamento.valor_entrada != 0){

                await SalePayment.create({
                    venda_id: venda_id, 
                    parcela: parcelas,
                    valor: pagamento.valor_entrada,
                    valor_restante: 0,
                    paga: true,
                    data_pagamento: moment().format('YYYY-MM-DD HH:mm:ss'),
                    data_vencimento: moment().format('YYYY-MM-DD'),
                    metodo_pagamento_id: pagamento.forma_pagamento_id
                })

                parcelas++

            }

            for(let i = 0; i < pagamento.quantidade_parcelas; i++){

                await SalePayment.create({
                    venda_id: venda_id, 
                    parcela: parcelas,
                    valor: pagamento.valor_parcelas,
                    valor_restante: pagamento.valor_parcelas,
                    paga: false,
                    data_pagamento: null,
                    data_vencimento: moment(pagamento.data_parcela).format('YYYY-MM-DD'),
                    metodo_pagamento_id: null
                })

                pagamento.data_parcela = moment(pagamento.data_parcela).add(1, 'M')

                parcelas++

            }
        }else{

            await SalePayment.create({
                venda_id: venda_id, 
                parcela: 1,
                valor: pagamento.valor_total,
                valor_restante: 0,
                paga: true,
                data_pagamento: moment().format('YYYY-MM-DD HH:mm:ss'),
                data_vencimento: moment().format('YYYY-MM-DD'),
                metodo_pagamento_id: pagamento.forma_pagamento_id
            })
        }
    }

    /**
     * Prepara o array com os pagamentos pendentes do cliente
     * @param venda 
     * @returns 
     */
    private async formatPayments(venda){

        let retorno : Array<object> = []

        for(let i = 0; i < venda.length; i++){

            const atual = venda[i]

            let valor_restante : any = 0

            let parcelas_restante  = 0

            for(let j = 0; j < atual.payments.length; j++){

                if(atual.payments[j].paga == false){

                    valor_restante = valor_restante + atual.payments[j].valor_restante

                    parcelas_restante++

                }
            }

            retorno.push({
                venda_id: atual.id,
                cliente: atual.client.nome,
                valor_total: parseFloat(atual.valor_total).toFixed(2),
                total_parcelas: atual.payments.length,
                valor_restante: parseFloat(valor_restante).toFixed(2),
                parcelas_restante: parcelas_restante
            })
        }

        return retorno

    }

	/**
	 * Função para formatar o valor restante da parcelas 
	 * @param produtos 
	 * @returns 
	 */
	private async formatValue(vendas){
        
		for(let i = 0; i < vendas.length; i++){
            
			const venda = vendas[i]
            
            if(venda.payments[0]){
                
                let valor_formatado = parseFloat(venda.payments[0].valor_restante).toFixed(2)
                
                valor_formatado = valor_formatado.toString().replace('.', ',')
                
                vendas[i].payments[0].valor_restante = valor_formatado

            }
		}
        
		return vendas

	}
}
