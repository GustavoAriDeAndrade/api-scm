/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/check', () => 'Ok!');

Route.post('users', 'UsersController.create')

Route.group(() => {

	/**
	 * Users
	 */
	Route.group(() => {
		Route.post('', 'UsersController.create').middleware([ 'group:admin'])
		Route.get('', 'UsersController.read').middleware([ 'group:admin' ])
		Route.get(':id', 'UsersController.find').middleware([ 'group:admin' ])
		Route.put(':id', 'UsersController.update').middleware([ 'group:admin' ])
	}).prefix('user')

	/**
	 * Clients
	 */
	Route.group(() => {
		Route.post('', 'ClientsController.create').middleware([ 'group:admin,caixa'])
		Route.get('', 'ClientsController.read').middleware([ 'group:admin,caixa' ])
		Route.get(':id', 'ClientsController.find').middleware([ 'group:admin,caixa' ])
		Route.put(':id', 'ClientsController.update').middleware([ 'group:admin,caixa' ])
		Route.get('select', 'ClientsController.select').middleware([ 'group:admin,caixa' ])
	}).prefix('client')

	/**
   	 * Products
   	 */
	Route.group(() => {
		Route.post('', 'ProductsController.create').middleware([ 'group:admin,caixa'])
		Route.get('', 'ProductsController.read').middleware([ 'group:admin,caixa' ])
		Route.get(':id', 'ProductsController.find').middleware([ 'group:admin,caixa' ])
		Route.put(':id', 'ProductsController.update').middleware([ 'group:admin,caixa' ])
	}).prefix('product')

	/**
   	 * Sales
   	 */
	Route.group(() => {
		Route.post('', 'SalesController.create').middleware([ 'group:admin,caixa'])
	}).prefix('sale')

	/**
	 * Groups
	 */
	Route.get('group', 'UsersController.readGroups').middleware([ 'group:admin,caixa' ])
	Route.get('getGroups', 'UsersController.getGroups').middleware([ 'group:admin,caixa' ])

	/**
	 * Selects
	 */
	Route.get('selectCliente', 'ClientsController.select').middleware([ 'group:admin,caixa' ])
	Route.get('selectProduto', 'ProductsController.select').middleware([ 'group:admin,caixa' ])
	Route.get('selectFormaPagamento', 'SalesController.select').middleware([ 'group:admin,caixa' ])
  
}).prefix('api').middleware(['auth','context'])

Route.group(() => {	
	/**
	 * Dados usuário conectado
	 */
  Route.get('me', 'UsersController.me').middleware(['auth'])
	/**
	 * Login
	 */
	Route.post('login', 'UsersController.login').middleware(['context'])

}).prefix('api')
