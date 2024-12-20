const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function addNews(title: string, content: string, category: string, date: Date) {
    const news = await prisma.news.create({
        data: {
            title: title,
            content: content,
            category: category,
            created_at: date,
            updated_at: date,
        }
    });
    console.log(news.news_id);
    return news.news_id;
}

export async function updateNews(news_id: number, title: string, content: string, category: string, date: Date) {
    const check = await prisma.news.findUnique({
        where: {
            news_id: news_id,
        }
    })
    if(!check) {
        throw new Error("Không tồn tại tin tức nào với mã tin tức là news_id");
    }

    await prisma.news.update({
        where: {
            news_id: news_id,
        },
        data: {
            title: title,
            content: content,
            category: category,
            updated_at: date,
        }
    });
}


export async function deleteNews(news_id: number) {
    const check = await prisma.news.findUnique({
        where: {
            news_id: news_id,
        }
    });
    if(!check) {
        throw new Error("Không tồn tại tin tức nào với mã tin tức là news_id");
    }
    await prisma.news.delete({
        where: {
            news_id: news_id,
        }
    });
}

export async function addAircraft(manufacturer: string, model: string, capacity: number, economy_seats: number, business_seats: number, first_seats: number) {
    const aircraft = await prisma.aircrafts.create({
        data: {
            manufacturer: manufacturer,
            model: model, 
            capacity: capacity, 
            economy_seats: economy_seats, 
            business_seats: business_seats, 
            first_class_seats: first_seats
        }
    });
    return aircraft.aircraft_id;
}

export async function addFlight(aircraft_id: number, departure_airport: number, arrival_airport: number, departure_time: Date, arrival_time: Date, base_price: number, created_at: Date) {
    const aircraft = await prisma.aircrafts.findUnique({
        where: {
            aircraft_id: aircraft_id,
        }
    });
    if(!aircraft) {
        throw new Error("Không tồn tại máy bay nào có mã số là " + aircraft_id);
    }
    const flight = await prisma.flights.create({
        data: {
            aircraft_id: aircraft_id,
            departure_airport: departure_airport,
            arrival_airport: arrival_airport,
            departure_time: departure_time,
            arrival_time: arrival_time,
            base_price: base_price,
            updated_departure_time: departure_time,
            created_at: created_at,
        }
    });
    let economy_seats: number = aircraft['economy_seats'];
    let business_seats: number = aircraft['business_seats'];
    let first_seats: number = aircraft['first_seats'];
    for(var i: number = 0 ; i < economy_seats; ++i) {
        var seat_number: string = String.fromCharCode("A".charCodeAt(0) + (i/6)) + (i%6+1);
        var seat_type: string;
        if((i%6+1) == 1 || (i%6+1) == 1) seat_type = "Window";
        else if((i%6+1) == 2 || (i%6+1) == 5) seat_type = "Middle";
        else seat_type = "Aisle";
        await prisma.seat_assignments.create({
            data: {
                flight_id: flight.flight_id,
                seat_number: seat_number,
                class: "Economy",
                seat_type: seat_type,
                status: "Available",
            }
        })
    }
    for(var i: number = 0 ; i < business_seats; ++i) {
        var seat_number: string = String.fromCharCode("A".charCodeAt(0) + (i/3)) + (i%3+1);
        var seat_type: string;
        if((i%3+1) == 1 || (i%3+1) == 3) seat_type = "Window";
        else seat_type = "Middle";
        await prisma.seat_assignments.create({
            data: {
                flight_id: flight.flight_id,
                seat_number: seat_number,
                class: "Business",
                seat_type: seat_type,
                status: "Available",
            }
        })
    }
    for(var i: number = 0 ; i < first_seats; ++i) {
        var seat_number: string = String.fromCharCode("A".charCodeAt(0) + (i/2)) + (i%2+1);
        var seat_type: string = "Window";
        await prisma.seat_assignments.create({
            data: {
                flight_id: flight.flight_id,
                seat_number: seat_number,
                class: "First",
                seat_type: seat_type,
                status: "Available",
            }
        })
    }
    await prisma.flight_stats.create({
        data: {
            flight_id: flight.flight_id,
            total_tickets: 0,
            total_revenue: 0,
            last_updated: created_at,
        }
    })
    return flight.flight_id;
}

export async function addPromotions(flight_id: number, title: string, description: string, discount_rate: number, start_date: Date, end_date: Date){
    const promotion = await prisma.promotions.create({
        data: {
            title: title,
            description: description,
            discount_rate: discount_rate,
            start_date: start_date,
            end_date: end_date,
            flight_id: flight_id,
        }
    });
    console.log(promotion.promotion_id);
}

export async function deletePromotion(promotion_id: number){
    await prisma.promotions.delete({
        where: {
            promotion_id: promotion_id,
        }
    });
}

export async function summarizeFlight(flight_id: number){
    const response = await prisma.flight_stats.findMany({
        where: {
            flight_id: flight_id,
        }
    });
    return response;
}


export async function delay(flight_id:number, reason: string, delay_date: Date) {
    await prisma.flights.update({
        where: {
            flight_id: flight_id,
        },
        data: {
            delay_reason: reason,
            updated_departure_time: delay_date,
        }
    });
}

export async function test() {
    const test = await prisma.flight_stats.findMany({
        where: {
            flight_id: 2007,
        },
        
    })
    return test;
}