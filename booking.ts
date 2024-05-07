// You need to sign up to the affiliate program and submit tax documents in order
// to get access to this API

// AIRBNB appears to not have a public API

// https://duffel.com/blog/exploring-the-integration-of-travel-booking-portals-by-banks

// Solution? Go thorugh a GDS

fetch('https://demandapi-sandbox.booking.com/3.1/accommodations/availability', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        accommodation_ids: [12345],
        checkin: '2021-12-01',
        checkout: '2021-12-02',
    }),
}).then(console.log);