import { expect, test } from "../fixtures/fixtures";
import type { Booking } from "./models/booking";

// Unique data per test so we never confuse our booking with anyone else's.
function buildBooking(): Booking {
  const unique = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    firstname: `Roshik${unique}`,
    lastname: "Maharjan",
    totalprice: 100 + Math.floor(Math.random() * 900),
    depositpaid: true,
    bookingdates: { checkin: "2026-11-10", checkout: "2026-11-15" },
    additionalneeds: "Breakfast",
  };
}

test.describe("Booking API", () => {
  test("full booking lifecycle: create, read, update, delete", async ({
    api,
  }) => {
    const booking = buildBooking();
    let bookingId = 0;

    await test.step("create a booking", async () => {
      const created = await api.bookingClient.create(booking);
      expect(created.status).toBe(200);
      expect(created.body.bookingid).toEqual(expect.any(Number));
      bookingId = created.body.bookingid;
    });

    await test.step("read it back: every field matches what was sent", async () => {
      const saved = await api.bookingClient.getById(bookingId);
      expect(saved.status).toBe(200);
      expect(saved.body).toEqual(booking);
    });

    const updatedBooking: Booking = {
      ...booking,
      firstname: `${booking.firstname}Updated`,
      totalprice: booking.totalprice + 50,
    };

    await test.step("update first name and price, then read again", async () => {
      const updated = await api.bookingClient.update(bookingId, updatedBooking);
      expect(updated.status).toBe(200);

      const saved = await api.bookingClient.getById(bookingId);
      expect(saved.status).toBe(200);
      expect(saved.body.firstname).toBe(updatedBooking.firstname);
      expect(saved.body.totalprice).toBe(updatedBooking.totalprice);
      expect(saved.body).toEqual(updatedBooking);
    });

    await test.step("delete it, then reading it returns 404", async () => {
      const deleted = await api.bookingClient.delete(bookingId);
      expect(deleted.status).toBe(201);

      const gone = await api.bookingClient.getById(bookingId);
      expect(gone.status).toBe(404);
    });
  });

  test("update without a token is rejected and changes nothing", async ({
    api,
  }) => {
    const booking = buildBooking();
    const created = await api.bookingClient.create(booking);
    expect(created.status).toBe(200);
    const bookingId = created.body.bookingid;

    const attempted: Booking = {
      ...booking,
      firstname: `${booking.firstname}Changed`,
      totalprice: booking.totalprice + 999,
    };
    const response = await api.bookingClient.update(bookingId, attempted, {
      authenticated: false,
    });
    expect(response.status).toBe(403);

    // The 403 alone is not enough: prove the stored booking did not change.
    const saved = await api.bookingClient.getById(bookingId);
    expect(saved.status).toBe(200);
    expect(saved.body).toEqual(booking);
  });
});
