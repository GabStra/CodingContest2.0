import axios from "axios";

export enum ENDPOINTS {
  LOGIN = "/login",
  PASSWORD_RESET = "/password-reset",
  NEW_PASSWORD = "/new-password",
  NEW_PASSWORD_CHECK = "/new-password-check",
  REGISTRATION = "/registration",
  VERIFY = "/verify",
  LOGOUT = "/logout",
  NEW_COURSE = "/new-course",
  USERS_LIST = "/users-list",
  COURSES = "/courses",
  COURSE = "/course",
  AVAILABLE_COURSES = "/available-courses",
  REGISTER_COURSE = "/register-course",
  MY_COURSES_STUDENT = "/my-courses-student",
  MY_COURSES_TEACHER = "/my-courses-teacher",
  TAGS = "/tags",
  SAVE_TAG = "/save-tag",
  DELETE_TAG = "/delete-tag",
}

export interface Response<T> {
  statusCode: number;
  data: T;
}

export const BASE_URL = "http://localhost:60000";

export class Api {
  public async post<T, S = void>(
    endpoint: ENDPOINTS,
    data?: S,
    withCredentials: boolean = false
  ) {
    let response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      withCredentials: withCredentials,
    });

    if (!response) return null;
    return {
      statusCode: response.status,
      data: response.data as T,
    } as Response<T>;
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
    });

    if (!response) return null;
    return {
      statusCode: response.status,
      data: response.data as T,
    } as Response<T>;
  }

  public async get<T>(
    endpoint: ENDPOINTS,
    params?: any,
    withCredentials: boolean = false
  ) {
    let response = await axios.get(`${BASE_URL}${endpoint}`, {
      withCredentials: withCredentials,
      params: params,
    });

    if (!response) return null;
    return {
      statusCode: response.status,
      data: response.data as T,
    } as Response<T>;
  }

  public async delete<T>(
    endpoint: ENDPOINTS,
    params?: any,
    withCredentials: boolean = false
  ) {
    let response = await axios.delete(`${BASE_URL}${endpoint}`, {
      withCredentials: withCredentials,
      params: params,
    });

    if (!response) return null;
    return {
      statusCode: response.status,
      data: response.data as T,
    } as Response<T>;
  }
}

export const api = new Api();
