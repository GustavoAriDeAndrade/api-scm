import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import SaleProduct from 'App/Models/SaleProduct'

/**
 * Controller para gerenciar os relatórios
 */
export default class ReportsController {

    public async get({ request, response } : HttpContextContract){

        const body = request.all()

        if(body.relatorio_id == 1){

            const produtos = await SaleProduct.query().select('produto_id', 'quantidade', 'valor_unidade')
                .whereRaw('created_at >= ? and created_at <= ?', [body.data_de, body.date_ate])
                .preload('product', (productQuery) => {
                    productQuery.select('id', 'nome')
                })

            return response.status(200).send({ produtos })

        }else{

            return response.status(204).send({ message: 'É necessário selecionar um relatório válido' })

        }
    }
}
