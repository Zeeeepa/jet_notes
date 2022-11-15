-- Problem Statement
-- Your task is to prepare a list of cities with the date of last reservation made in the city and a main photo (photos[0]) of the most popular (by number of bookings) hotel in this city.

-- Sort results in ascending order by city. If many hotels have the same amount of bookings sort them by ID (ascending order). Remember that the query will also be run of different datasets.

/*
Please, write your SQL query below.
*/

SELECT DISTINCT ON (c.name)
    c.name AS "city",
    (
        SELECT Max(booking.booking_date)
        FROM city, hotel, booking
        WHERE city.id = c.id and city.id = hotel.city_id and hotel.id = booking.hotel_id
    ) AS "last_booking_date",
    Min(b.hotel_id) AS "hotel_id",
    h.photos ->> 0   
FROM city c
    INNER JOIN hotel h ON (c.id = h.city_id)
    INNER JOIN booking b ON (h.id = b.hotel_id)
GROUP BY 
	c.id, h.id
ORDER BY 
	c.name ASC, Count(b.id) DESC;
