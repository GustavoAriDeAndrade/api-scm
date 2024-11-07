import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Sale from 'App/Models/Sale'
import SaleProduct from 'App/Models/SaleProduct'

/**
 * Controller para gerenciar os relatórios
 */
export default class ReportsController {

    /**
     * Função para gerar os relatórios com base nos filtros
     * @param param0 
     * @returns 
     */
    public async get({ request, response } : HttpContextContract){

        const body = request.all()

        if(body.relatorio_id == 1){

            const produtos = await SaleProduct.query().select('produto_id', 'quantidade', 'valor_unidade')
                .whereRaw('created_at >= ? and created_at <= ?', [body.data_de, body.date_ate])
                .preload('product', (productQuery) => {
                    productQuery.select('id', 'nome')
                })

            return response.status(200).send({ produtos })

        }else if(body.relatorio_id == 2){

            const caixas = await Sale.query()
                .whereRaw('created_at >= ? and created_at <= ?', [body.data_de, body.date_ate])
                .preload('user', (userQuery) => {
                    userQuery.select('id', 'nome')
                }).if(body.user_id, (filter) => {
                    filter.where('usuario_id', body.user_id)
                })

            return response.status(200).send({ caixas })

        }else if(body.relatorio_id == 3){

            const clientes = await Database.rawQuery(
                'SELECT\
                    sp.venda_id, sp.data_vencimento, valor_restante, s.valor_total, s.created_at, c.nome\
                FROM\
                    sale_payments sp\
                INNER JOIN\
                    (SELECT\
                        venda_id, MIN(data_vencimento) AS data_vencimento\
                    FROM\
                        sale_payments\
                    WHERE\
                        paga = FALSE\
                            AND data_vencimento BETWEEN ? AND ?\
                    GROUP BY venda_id) AS recent_payments ON sp.venda_id = recent_payments.venda_id\
                        AND sp.data_vencimento = recent_payments.data_vencimento\
                INNER JOIN\
                    sales s ON sp.venda_id = s.id\
                INNER JOIN\
                    clients c ON s.cliente_id = c.id\
                WHERE\
                    sp.paga = FALSE', [body.data_de, body.date_ate])

            return response.status(200).send({ clientes })

        }else{

            return response.status(204).send({ message: 'É necessário selecionar um relatório válido' })

        }
    }
}
