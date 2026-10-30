import type { AuthSession } from "../authSession";
import type { HttpClient, HttpResponse } from "../httpClient";
import type { Booking, CreateBookingResponse } from "../models/booking";

export interface AuthOptions {
  /** Set to false to send the request without the token cookie. */
  authenticated?: boolean;
}

export class BookingClient {
  private readonly createdIds = new Set<number>();

  constructor(
    private readonly http: HttpClient,
    private readonly auth: AuthSession,
  ) {}

  public async create(
    booking: Booking,
  ): Promise<HttpResponse<CreateBookingResponse>> {
    const response = await this.http.post<CreateBookingResponse>("/booking", {
      data: booking,
    });
    if (response.status === 200 && response.body?.bookingid) {
      this.createdIds.add(response.body.bookingid);
    }
    return response;
  }

  public getById(id: number): Promise<HttpResponse<Booking>> {
    return this.http.get<Booking>(`/booking/${id}`);
  }

  public async update(
    id: number,
    booking: Booking,
    options: AuthOptions = {},
  ): Promise<HttpResponse<Booking>> {
    return this.http.put<Booking>(`/booking/${id}`, {
      data: booking,
      headers: await this.headersFor(options),
    });
  }

  public async delete(
    id: number,
    options: AuthOptions = {},
  ): Promise<HttpResponse<string>> {
    const response = await this.http.delete<string>(`/booking/${id}`, {
      headers: await this.headersFor(options),
    });
    if (response.status === 201) {
      this.createdIds.delete(id);
    }
    return response;
  }

  /**
   * Deletes every booking this client created that has not been deleted yet.
   * 404/405 mean the booking is already gone (for example after a server reset).
   */
  public async deleteAllCreated(): Promise<void> {
    const failures: string[] = [];
    for (const id of [...this.createdIds]) {
      const response = await this.delete(id);
      if (response.status === 404 || response.status === 405) {
        this.createdIds.delete(id);
      } else if (response.status !== 201) {
        failures.push(`booking ${id}: status ${response.status}`);
      }
    }
    if (failures.length > 0) {
      throw new Error(`Cleanup failed for ${failures.join(", ")}`);
    }
  }

  private async headersFor(
    options: AuthOptions,
  ): Promise<Record<string, string>> {
    return options.authenticated === false ? {} : this.auth.authHeaders();
  }
}
