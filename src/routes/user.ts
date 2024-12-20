import { Hono } from "hono";
import * as query from "../prisma/user_query";

const route = new Hono();

/**
 * Hiển thị vé của khách hàng
 */
route.get("/tickets/:customer_id", async (c) => {
  try {
    const customer_id = parseInt(c.req.param("customer_id"), 10);
    
    if (isNaN(customer_id)) {
      return c.text("Customer ID không đúng định dạng");
    }

    const response = await query.getTicketOfCustomer(customer_id);

    return c.json(response); 
   
  } catch (error) {
    if (error instanceof Error) {
        return c.text(error.message);
    }
  }
});

/**
 * Huỷ vé
 */
route.put("/tickets/:reservation_id", async (c) => {
  try {
    const reservation_id = parseInt(c.req.param("reservation_id"), 10);

    if (isNaN(reservation_id)) {
        return c.text("Reservation ID không đúng định dạng");
    }
    console.log("CHECK");
    const response = await query.cancelTicket(reservation_id);

    return c.text("Huỷ vé thành công");

  } catch (error) {
    if (error instanceof Error) {
        return c.text(error.message);
    }
  }
});

/**
 * Đặt vé
 */
route.post("/tickets", async (c) => {
  try {
    const { customer_id, flight_id, seat_number, ticket_class, ticket_price, booking_date } = await c.req.json();

    if (!customer_id || !flight_id || !seat_number || !ticket_class || !ticket_price || !booking_date) {
        return c.text("Thiếu tham số");
    }
    const response = await query.bookTicket(customer_id, flight_id, seat_number, ticket_class, ticket_price, booking_date);

    return c.text("Đặt vé thành công");
  } catch (error) {
    if (error instanceof Error) {
        return c.text(error.message);
    }
  }
});

/**
 * Tìm kiếm chuyến bay
 */
route.post("/flights", async (c) => {
  try {
    const {from, to, departure_time, person, ticket_class } = await c.req.json();

    if (!from || !to || !departure_time || !person || !ticket_class) {
      return c.text("Thiếu tham số"); 
    }

    const departure = await query.searchFlights(from, to, departure_time, person, ticket_class);

    return c.json(departure); 
  } catch (error) {
    if (error instanceof Error) {
        return c.text(error.message);
    }
  }
});

/**
 * Gợi ý chuyến bay
 */
route.get("/flights/:from", async (c) => {
  try {
    const from = c.req.param("from");

    if (!from) {
      return c.text("Thiếu tham số \"from\""); 
    }

    const response = await query.suggestion(from);

    return c.json(response); 

  } catch (error) {
    if (error instanceof Error) {
        return c.text(error.message);
    }
  }
});

/**
 * Tin tức
 */
route.get("/news", async (c) => {
  try {
    const response = await query.news();
    return c.json(response); 
  } catch (error) {
    if (error instanceof Error) {
        return c.text(error.message);
    }
  }
});
export default route;
