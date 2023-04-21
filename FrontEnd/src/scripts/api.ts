import axios from 'axios'
import { ENDPOINTS } from 'shared/dist/constants/endpoints'

export interface Response<T> {
    statusCode: number
    data: T
}

export const BASE_URL = 'http://localhost:60000'

export class Api {
    public async post<T, S = void>(
        endpoint: ENDPOINTS,
        data?: S,
        withCredentials: boolean = false
    ) {
        let response = await axios.post(`${BASE_URL}${endpoint}`, data, {
            withCredentials: withCredentials,
        })

        if (!response) return null
        return {
            statusCode: response.status,
            data: response.data as T,
        } as Response<T>
    }

    public async postWithParams<T, S = void>(
        endpoint: ENDPOINTS,
        data?: S,
        params?: any,
        withCredentials: boolean = false
    ) {
        let response = await axios.post(`${BASE_URL}${endpoint}`, data, {
            withCredentials: withCredentials,
            params: params,
        })

        if (!response) return null
        return {
            statusCode: response.status,
            data: response.data as T,
        } as Response<T>
    }

    public async get<T>(
        endpoint: ENDPOINTS,
        params?: any,
        withCredentials: boolean = false
    ) {
        let response = await axios.get(`${BASE_URL}${endpoint}`, {
            withCredentials: withCredentials,
            params: params,
        })

        if (!response) return null
        return {
            statusCode: response.status,
            data: response.data as T,
        } as Response<T>
    }

    public async delete<T>(
        endpoint: ENDPOINTS,
        params?: any,
        withCredentials: boolean = false
    ) {
        let response = await axios.delete(`${BASE_URL}${endpoint}`, {
            withCredentials: withCredentials,
            params: params,
        })

        if (!response) return null
        return {
            statusCode: response.status,
            data: response.data as T,
        } as Response<T>
    }
}

export const api = new Api()
