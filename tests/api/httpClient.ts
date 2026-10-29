import { request, type APIRequestContext } from "@playwright/test";
import { getApiConfig } from "./apiConfig";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface RequestOptions {
  data?: unknown;
  headers?: Record<string, string>;
}

export interface HttpResponse<T = unknown> {
  status: number;
  body: T;
}

/**
 * The only place that sends HTTP requests. It knows the base URL and the JSON
 * headers, and nothing about bookings or tokens.
 */
export class HttpClient {
  private constructor(private readonly context: APIRequestContext) {}

  public static async create(): Promise<HttpClient> {
    const { baseUrl } = getApiConfig();
    const context = await request.newContext({
      baseURL: baseUrl,
      extraHTTPHeaders: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return new HttpClient(context);
  }

  public get<T>(path: string, options?: RequestOptions) {
    return this.send<T>("GET", path, options);
  }

  public post<T>(path: string, options?: RequestOptions) {
    return this.send<T>("POST", path, options);
  }

  public put<T>(path: string, options?: RequestOptions) {
    return this.send<T>("PUT", path, options);
  }

  public delete<T>(path: string, options?: RequestOptions) {
    return this.send<T>("DELETE", path, options);
  }

  public async dispose(): Promise<void> {
    await this.context.dispose();
  }

  private async send<T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const response = await this.context.fetch(path, {
      method,
      data: options.data,
      headers: options.headers,
    });
    console.log(`[HTTP ${method}] ${path} -> ${response.status()}`);

    const contentType = response.headers()["content-type"] ?? "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return { status: response.status(), body: body as T };
  }
}
