import { apiBaseUrl } from "./config";

export type ApiResponse = {
  status: number;
  body: unknown;
};

export type FormFields = Record<string, string | boolean>;

export class ApiClient {
  async get(path: string, token?: string): Promise<ApiResponse> {
    return this.request(path, { method: "GET" }, token);
  }

  async post(
    path: string,
    fields?: FormFields,
    token?: string,
  ): Promise<ApiResponse> {
    return this.request(
      path,
      { method: "POST", body: this.toUrlEncodedForm(fields) },
      token,
    );
  }

  async patch(
    path: string,
    fields: FormFields,
    token?: string,
  ): Promise<ApiResponse> {
    return this.request(
      path,
      { method: "PATCH", body: this.toUrlEncodedForm(fields) },
      token,
    );
  }

  async put(
    path: string,
    fields: FormFields,
    token?: string,
  ): Promise<ApiResponse> {
    return this.request(
      path,
      { method: "PUT", body: this.toUrlEncodedForm(fields) },
      token,
    );
  }

  async delete(path: string, token?: string): Promise<ApiResponse> {
    return this.request(path, { method: "DELETE" }, token);
  }

  private toUrlEncodedForm(fields?: FormFields): URLSearchParams | undefined {
    if (!fields) {
      return undefined;
    }

    const form = new URLSearchParams();
    for (const [name, value] of Object.entries(fields)) {
      form.set(name, String(value));
    }
    return form;
  }

  private async request(
    path: string,
    init: RequestInit,
    token?: string,
  ): Promise<ApiResponse> {
    const headers = new Headers(init.headers);
    if (token) {
      headers.set("x-auth-token", token);
    }

    const response = await fetch(new URL(path.replace(/^\//, ""), apiBaseUrl), {
      ...init,
      headers,
    });
    const responseText = await response.text();
    let body: unknown = responseText;

    if (responseText.length > 0) {
      try {
        body = JSON.parse(responseText) as unknown;
      } catch (error) {
        if (
          response.headers.get("content-type")?.includes("application/json")
        ) {
          throw new Error(
            `API returned invalid JSON for ${init.method} ${path}`,
            { cause: error },
          );
        }
      }
    }

    return { status: response.status, body };
  }
}
