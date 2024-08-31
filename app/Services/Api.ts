import Axios from "axios"
const https = require('https')

class Api {
    private base_url: string
    private axios
    constructor(base_url: string, headers){
        this.base_url = base_url
        this.axios = Axios.create({
            baseURL: this.base_url,
            headers: headers,
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        })
    }
    get(path: string, params, headers = {}, responseType : string = 'application/json'){
        return new Promise((resolve, reject) => {
            this.axios({
                method: 'get',
                url: path,
                headers,
                responseType: responseType,
                params: params
            }).then(function (response){
                resolve({data: response['data'] != undefined ? response['data'] : {}, status: response['status']})
            }).catch((response) => {
                console.log(response)
                reject({ data: response['data'] != undefined ? response['data'] : {}, status: response['status']})
            })
        })
    }

    post(path: string, headers = {}, params, data, responseType : string = 'application/json'){
        return new Promise((resolve) => {
            this.axios({
                method: 'post',
                url: path,
                responseType: responseType,
                data,
                headers,
                params: params
            }).then(function (response){
                resolve({data: response['data'] != undefined ? response['data'] : {}, status: response['status']})
            }).catch((response) => {
                console.log(response.toJSON())
                resolve({data: response['response'] != undefined && response['response']['data'] != undefined ? response['response']['data'] : {}, status:response['status']})
            })
        })
    }

    put(path: string, headers = {}, params , data, responseType : string = 'application/json'){
        return new Promise((resolve) => {
            this.axios({
                method: 'put',
                url: path,
                responseType: responseType,
                data,
                headers,
                params: params
            }).then(function (response){
                resolve({data: response['data'] != undefined ? response['data'] : {}, status: response['status']})
            }).catch((response) => {
                resolve({data: response['response']['data'] != undefined ? response['response']['data'] : {}, status: response['status']})
            })
        })
    }

    patch(path: string, headers = {}, params, data, responseType : string = 'application/json'){
        return new Promise((resolve) => {
            this.axios({
                method: 'patch',
                url: path,
                responseType: responseType,
                data,
                headers,
                params: params
            }).then(function (response){
                resolve({data: response['data'] != undefined ? response['data'] : {}, status: response['status']})
            }).catch((response) => {
                resolve({data: response['response']['data'] != undefined ? response['response']['data'] : {}, status: response['status']})
            })
        })
    }

    delete(path: string, headers = {}, params, data, responseType : string = 'application/json'){
        return new Promise((resolve)=>{
            this.axios({
                method: 'delete',
                url: path,
                responseType: responseType,
                data,
                headers,
                params:params
            }).then(function (response) {
                resolve({data: response['data'] != undefined ? response['data'] : {}, status: response['status']})
            }).catch((response) => {
                resolve({data: response['response']['data'] != undefined ? response['response']['data'] : {}, status: response['status']})
            })
        })
    }
}
export default Api

