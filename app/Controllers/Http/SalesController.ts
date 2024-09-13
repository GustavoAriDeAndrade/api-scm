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
     * Busca as formas de pagamento cadastradas para listar no select
     * @param param0 
     * @returns 
     */
    public async select({ response } : HttpContextContract){

        const types = await TypePayment.query().select('id', 'nome').orderBy('nome')

		return response.status(200).send({ types })

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
}
