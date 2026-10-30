import { AuthSession } from "./authSession";
import { BookingClient } from "./clients/bookingClient";
import { HttpClient } from "./httpClient";

export class ApiManager {
  private constructor(
    private readonly http: HttpClient,
    public readonly bookingClient: BookingClient,
  ) {}

  /** Builds ONE HttpClient and ONE AuthSession and passes them to every client. */
  public static async create(): Promise<ApiManager> {
    const http = await HttpClient.create();
    const auth = new AuthSession(http);
    return new ApiManager(http, new BookingClient(http, auth));
  }

  /** Deletes everything the clients created during the test. */
  public async cleanup(): Promise<void> {
    await this.bookingClient.deleteAllCreated();
  }

  public async dispose(): Promise<void> {
    await this.http.dispose();
  }
}
