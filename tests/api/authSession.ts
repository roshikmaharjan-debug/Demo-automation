import { getApiConfig } from "./apiConfig";
import type { HttpClient } from "./httpClient";
import type { AuthRequest, AuthResponse } from "./models/booking";

/**
 * Logs in with POST /auth the first time a token is needed and keeps the token
 * for the rest of the worker. Each Playwright worker is its own process, so a
 * static field lives exactly as long as the worker.
 */
export class AuthSession {
  private static tokenPromise: Promise<string> | null = null;

  constructor(private readonly http: HttpClient) {}

  public async getToken(): Promise<string> {
    if (!AuthSession.tokenPromise) {
      AuthSession.tokenPromise = this.login().catch((error: unknown) => {
        // Do not cache a failed login; the next call may try again.
        AuthSession.tokenPromise = null;
        throw error;
      });
    }
    return AuthSession.tokenPromise;
  }

  public async authHeaders(): Promise<Record<string, string>> {
    return { Cookie: `token=${await this.getToken()}` };
  }

  private async login(): Promise<string> {
    const { username, password } = getApiConfig();
    const credentials: AuthRequest = { username, password };
    const response = await this.http.post<AuthResponse>("/auth", {
      data: credentials,
    });

    // Restful Booker answers 200 with { reason: "Bad credentials" } on failure,
    // so the status alone is not enough.
    if (response.status !== 200 || !response.body?.token) {
      throw new Error(
        `Login failed: status ${response.status}, body ${JSON.stringify(response.body)}`,
      );
    }
    return response.body.token;
  }
}
