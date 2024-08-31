// import Company from "App/Models/Company"
// import Device from "App/Models/Device"
// import User from "App/Models/User"
// import axios from "axios"
// import Env from '@ioc:Adonis/Core/Env'
// import Procedure from "App/Models/Procedure"


// interface OneSignalMessage{
//     app_id: String,
//     include_player_ids: string[],
//     headings: {
//         en: String,
//     },
//     contents: {
//         en: String,
//     },
//     url: String
// }

// class Pusher{

//     private async notifyOneSignal(message : OneSignalMessage){
//         try{
//             axios({
//                 method: 'POST',
//                 url: process.env.ONE_SIGNAL_APP_URL_API_POST_NOTIFICATION,
//                 data: message,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': process.env.ONE_SIGNAL_APP_TOKEN
//                 }
//             }).then(() => {

//             }).catch(() => {

//             })
//         }catch(e){
//             console.log(e)
//         }
//     }

//     public async notify(atendente, empresa, procedimento){

//         try{

//             const user = await User.query().select('uuid', 'name').where('uuid', atendente).first()

//             const company = await Company.query().select('uuid', 'name').where('uuid', empresa).first()

//             const procedure = await Procedure.query().select('uuid', 'name').where('uuid', procedimento).first()

//             const receptionists = await User.query().select('uuid', 'name', 'group_uuid').preload('companies', (companyQuery) => {
//                 companyQuery.select('uuid')}).whereHas('companies', (query_preload) => {
//                     query_preload.where('companies.uuid', empresa)
//                 }).preload('group', (groupQuery) => {
//                 groupQuery.select('uuid', 'name', 'key')}).whereHas('group', (query_preload) => {
//                     query_preload.where('key', '=', 'company-receptionist')
//                 }) 

//             if(user && company && procedure){

//                 if(receptionists){

//                     let notificar = receptionists.map((recepcionistas) => {return recepcionistas.uuid})

//                     notificar.push(user.uuid)

//                     const devices = await Device.query().whereIn('user_uuid', notificar)
                    
//                     if(devices){

//                         const promises : Array<Promise<any>> = []

//                         for(let i = 0; i < devices.length; i++){

//                             let device = devices[i]

//                             if(device.token == null){
//                                 continue
//                             }

//                             promises.push(this.notifyOneSignal({
//                                 app_id: Env.get('ONE_SIGNAL_APP_ID'),
//                                 include_player_ids: [device.token],
//                                 headings: {
//                                     en: 'Novo agendamento para ' + String(user.name),
//                                 },
//                                 contents: {
//                                     en: String(company.name) + ' - ' + String(procedure.name)
//                                 },
//                                 url: Env.get('BASE_URL')
//                             }))
//                         }
//                     }

//                 }else{

//                     const devices = await Device.query().where('user_uuid', user.uuid)
                    
//                     if(devices){

//                         const promises : Array<Promise<any>> = []

//                         for(let i = 0; i < devices.length; i++){

//                             let device = devices[i]

//                             promises.push(this.notifyOneSignal({
//                                 app_id: Env.get('ONE_SIGNAL_APP_ID'),
//                                 include_player_ids: [device.token],
//                                 headings: {
//                                     en: 'Novo agendamento para ' + String(user.name),
//                                 },
//                                 contents: {
//                                     en: String(company.name) + ' - ' + String(procedure.name)
//                                 },
//                                 url: Env.get('BASE_URL')
//                             }))
//                         }
//                     }
//                 }
//             }
//         }catch(e){

//             console.log(e)

//         }
//     }
// }

// export default new Pusher()