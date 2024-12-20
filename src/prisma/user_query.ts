const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function getTicketOfCustomer(customer_id: number) {
    const Ticket = await prisma.reservations.findMany({
        where: {customer_id: customer_id},
        include: {
            flights: {
                include: {
                    airports_flights_departure_airportToairports: true,
                    airports_flights_arrival_airportToairports: true
                }
            },
            tickets: true
        }
    });
    if(Ticket.length === 0) throw new Error("Chưa có chuyến bay nào");
    return Ticket;
}

export async function cancelTicket(reservation_id: number) {
    const reservation = await prisma.reservations.findUnique({
        where: { reservation_id },
    });

    // Nếu không tìm thấy bản ghi, trả về thông báo lỗi
    if (!reservation) {
        throw new Error("Huỷ vé thất bại do không tồn tại mã đặt chỗ là " + reservation_id);
    }
    const flight_id = reservation.flight_id;
    console.log(flight_id);
    const seat = await prisma.tickets.findMany({
        where: {
            reservation_id: reservation_id,
        },
        select: {
            seat_number: true,
            price: true,
        }
    });
    let sum: number = 0;
    for(const x of seat) {
        sum += x.price;
    }
    let array = [];
    for(var x of seat) {
        array.push(x.seat_number);
    }
    // Thực hiện xóa bản ghi nếu tồn tại
    await prisma.reservations.update({
        where: { reservation_id },
        data: {
            status: "Cancelled",
        }
    });

    await prisma.tickets.updateMany({
        where: { reservation_id: reservation_id },
        data: {
            status: "Cancelled",
        }
    });



    await prisma.seat_assignments.updateMany({
        where: {
            flight_id: flight_id,
            seat_number: {
                in: array,
            }
        },
        data: {
            status: "Available",
        }
    });

    await prisma.flight_stats.updateMany({
        where: {
            flight_id: flight_id,
        },
        data: {
            total_tickets: {
                increment: - seat.length,
            },
            total_revenue: {
                increment: - sum,
            }
        }
    });


}

export async function bookTicket(customer_id: number, flight_id: number, seat_number: string, ticket_class: string, ticket_price: number, booking_date: Date) {
    
    const reservation = await prisma.reservations.create({
        data: {
            customer_id: customer_id,
            flight_id: flight_id,
            booking_date: booking_date,
            status: 'Confirmed', // Hoặc trạng thái khác tùy theo yêu cầu
        },
    });
    console.log(reservation.reservation_id);
    const ticket = await prisma.tickets.create({
        data: {
            reservation_id: reservation.reservation_id,
            seat_number: seat_number,
            class: ticket_class,
            price: ticket_price,
            status: 'Active', // Trạng thái vé (ví dụ: Active, Cancelled)
        },
    });

    const seat = await prisma.seat_assignments.updateMany({
        where: {
            AND:[
                {flight_id: flight_id},
                {seat_number: seat_number},
                {class: ticket_class}
            ]
        },
        data: {
            status: "Booked",
        }
    });

    await prisma.flight_stats.updateMany({
        where: {
            flight_id: flight_id,
        },
        data: {
            total_tickets: {
                increment: 1,
            },
            total_revenue: {
                increment: ticket_price,
            },
            last_updated: booking_date,
        }
    });

    return {
        reservation,
        ticket,
    };
}

export async function searchFlights(from: string, to: string, date: Date, person: number, ticket_class: string) {
    const list_id = await prisma.seat_assignments.groupBy({
        by: ["flight_id"],  // Nhóm theo flight_id
        where: {
          class: ticket_class  // Điều kiện lọc theo class
        },
        _count: {  // Đếm số lượng bản ghi trong mỗi nhóm
          flight_id: true
        },
        having: {
          flight_id: {
            _count: {
              gt: person  // Lọc các nhóm có số lượng flight_id lớn hơn person
            }
          }
        }
      });
      
      // Tạo mảng flight_id từ kết quả groupBy
      const flightIds = [];
      for(const x of list_id) {
        flightIds.push(x.flight_id);
      }

      
      // Truy vấn tất cả các chuyến bay một lần
      const flights = await prisma.flights.findMany({
        where: {
          flight_id: {
            in: flightIds,  // Lọc các chuyến bay có id trong flightIds
          },
          airports_flights_departure_airportToairports: {
            location: from,  // location xuất phát là 'from'
          },
          airports_flights_arrival_airportToairports: {
            location: to,  // location đến là 'to'
          },
              updated_departure_time: date, // Điều kiện 2
        },
        include: {
          airports_flights_departure_airportToairports: true,  // Đưa thông tin sân bay xuất phát vào
          airports_flights_arrival_airportToairports: true,
          promotions: {
            take: 1,
            where: {
              start_date: {
                lt: date 
              },
              end_date: {
                gt: date
              }
            },
            orderBy: {
              discount_rate: 'desc',
            },
            select: {
              discount_rate: true
            }
          },   // Đưa thông tin sân bay đến vào
        },
      });
      if(!flights) throw new Error("Không có chuyến bay nào như bạn yêu cầu");
      return flights;
      
      
}

export async function suggestion(from: string) {
    const places = await prisma.flights.findMany({
        where: {
            airports_flights_departure_airportToairports: {
                location: from,  
            },
        },
        select: {
            base_price: true,
            airports_flights_arrival_airportToairports: {
                select: {
                    location: true,
                    country: true,
                }
            },
            promotions: {
                take: 1,
                where: {
                    start_date: {
                        lt: new Date() 
                    },
                    end_date: {
                        gt: new Date()
                    }
                },
                orderBy: {
                    discount_rate: 'desc',
                },
                select: {
                    discount_rate: true
                }
            }
        }
    });
    if(places.length === 0) throw new Error("Không có chuyến bay nào bắt đầu từ " + from);
    return places;
}


export async function news() {
    const news = await prisma.news.findMany({});
    const promotions = await prisma.promotions.findMany({});
    return {news, promotions};
}

