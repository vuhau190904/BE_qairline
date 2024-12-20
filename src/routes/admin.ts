import { Hono } from "hono";
import * as query from "../prisma/admin_query";

const route = new Hono();

/**
 * Đăng tin tức
 */
route.post("/news", async (c) => {
    try {
        const {title, content, category, date} = await c.req.json();
        if(!title || !content || !category || !date) 
            return c.text("Thiếu tham số");
        const response = await query.addNews(title, content, category, date);
        return c.text("Đăng thông tin thành công với newId là " + response);
    } catch(error) {
        if (error instanceof Error) {
            return c.text(error.message);
        }
    }
});

/**
 * Sửa tin 
 */
route.put("/news", async (c) => {
    try {
        const {news_id, title, content, category, date} = await c.req.json();
        if(!news_id || !title || !content || !category || !date) 
            return c.text("Thiếu tham số");
        const response = await query.updateNews(news_id, title, content, category, date);
        return c.text("Sửa thông tin thành công");
    } catch(error) {
        if (error instanceof Error) {
            return c.text(error.message);
        }
    }
});

/**
 * Xoá tin
 */
route.delete("/news/:news_id", async (c) => {
    try {
        const news_id = parseInt(c.req.param("news_id"), 10);
        if (isNaN(news_id)) {
            return c.text("NewsId không đúng định dạng");
          }
        const response = await query.deleteNews(news_id);
        return c.text("Gỡ thông tin thành công");
    } catch(error) {
        if (error instanceof Error) {
            return c.text(error.message);
        }
    }
});

/**
 * Nhập dữ liệu tàu bay
 */
route.post("/aircraft", async (c) => {
    try {
        const {manufacturer, model, capacity, economy_seats, business_seats, first_seats} = await c.req.json();
        if(!manufacturer || !model || !capacity || !economy_seats || !business_seats || !first_seats) {
            console.log(manufacturer + " " + model + " " + capacity + " " + economy_seats + " " + business_seats + " " + first_seats);
            return c.text("Thiếu tham số");
        }
        const response = await query.addAircraft(manufacturer, model, capacity, economy_seats, business_seats, first_seats);
        return c.text("Nhập dữ liệu tàu bay thành công với aircraft_id là " + response);
    } catch(error) {
        if (error instanceof Error) {
            return c.text(error.message);
        }
    }
});

/**
 * Nhập dữ liệu chuyến bay
 */
route.post("/flight", async (c) => {
    try {
        const {aircraft_id, departure_airport, arrival_airport, departure_time, arrival_time, base_price, created_at} = await c.req.json();
        if(!aircraft_id || !departure_airport || !arrival_airport || !departure_time || !arrival_time || !base_price || !created_at) 
            return c.text("Thiếu tham số");
        const response = await query.addFlight(aircraft_id, departure_airport, arrival_airport, departure_time, arrival_time, base_price, created_at);
        return c.text("Nhập dữ liệu chuyến bay thành công với flights_id là " + response);
    } catch(error) {
        if (error instanceof Error) {
            return c.text(error.message);
        }
    }
});

/**
 * Tạo khuyến mại cho chuyến bay
 */
route.post("/flight/promotion", async(c) => {
    try {
        const {flight_id, title, description, discount_rate, start_date, end_date} = await c.req.json();
        if(!flight_id || !title || !description || !discount_rate || !start_date || !end_date) {
            return c.text("Thiếu tham số");
        }
        const response = await query.addPromotions(flight_id, title, description, discount_rate, start_date, end_date);
        return c.text("Tạo mã khuyễn mại cho chuyến bay mã " + flight_id + " thành công");
    } catch(error) {
        if (error instanceof Error) {
            return c.text(error.message);
        }
    }
});

/**
 * Xoá mã khuyến mại
 */
route.delete("/flight/promotion/:id", async(c) => {
    try {
        const id = parseInt(c.req.param("id"), 10);
        query.deletePromotion(id);
        return c.text("Xoá mã khuyến mại thành công");
    } catch(error) {
        if (error instanceof Error) {
            return c.text(error.message);
        }
    }
});

/**
 * Delay
 */
route.put("/flight", async (c) => {
    try {
        const {flight_id, reason, delay_date} = await c.req.json();
        if(!flight_id || !reason || !delay_date) 
            return c.text("Thiếu tham số");
        const response = await query.delay(flight_id, reason, delay_date);
        return c.text("Cập nhật thay đổi giờ bay thành công");
    } catch(error) {
        if (error instanceof Error) {
            return c.text(error.message);
        }
    }
});

/**
 * Thống kê đặt vé của chuyến bay
 */
route.get("/flight/:id", async(c) => {
    try{
        const id = parseInt(c.req.param("id"), 10);
        const response = await query.summarizeFlight(id);
        return c.json(response);
    } catch(error) {
        if (error instanceof Error) {
            return c.text(error.message);
        }
    }
})

/**
 * test
 */
route.get("/test", async(c) => {
    const response = await query.test();
    var i = 10;
    var seat_number: string = String.fromCharCode("A".charCodeAt(0) + (i/6)) + (i%6+1);
    console.log(seat_number);
    return c.json(response);
});

export default route;