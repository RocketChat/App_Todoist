import { IHttp, IHttpRequest, IHttpResponse } from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { TodoistApp } from '../../TodoistApp';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface IHttpOptions extends IHttpRequest {
  headers?: { [key: string]: string };
  data?: any;
  params?: { [key: string]: string };
}

export class HttpHelper {
  constructor(
    private readonly app: TodoistApp,
    private readonly http: IHttp
  ) {}

  public async call(
    user: IUser,
    method: HttpMethod,
    url: string,
    options: IHttpOptions = {}
  ): Promise<IHttpResponse> {
    try {
      const token = await this.app.getOauth2ClientInstance().getAccessTokenForUser(user);

      const headers = {
        Authorization: `Bearer ${token?.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const requestOptions: IHttpOptions = {
        ...options,
        headers,
      };

      switch (method) {
        case 'GET':
          return await this.http.get(url, requestOptions);
        case 'POST':
          return await this.http.post(url, requestOptions);
        case 'PUT':
          return await this.http.put(url, requestOptions);
        case 'DELETE':
          return await this.http.del(url, requestOptions);
        case 'PATCH':
          return await this.http.patch(url, requestOptions);
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
    } catch (error) {
      this.app.getLogger().error(`HTTP ${method} request failed:`, error);
      throw error;
    }
  }

  public async get(user: IUser, url: string, options?: IHttpOptions): Promise<IHttpResponse> {
    return this.call(user, 'GET', url, options);
  }

  public async post(user: IUser, url: string, options?: IHttpOptions): Promise<IHttpResponse> {
    return this.call(user, 'POST', url, options);
  }

  public async put(user: IUser, url: string, options?: IHttpOptions): Promise<IHttpResponse> {
    return this.call(user, 'PUT', url, options);
  }

  public async delete(user: IUser, url: string, options?: IHttpOptions): Promise<IHttpResponse> {
    return this.call(user, 'DELETE', url, options);
  }

  public async patch(user: IUser, url: string, options?: IHttpOptions): Promise<IHttpResponse> {
    return this.call(user, 'PATCH', url, options);
  }
}
