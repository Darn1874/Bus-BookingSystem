// Sample data for demonstration
const sampleData = {
    users: [
        { id: 1, name: "Admin User", email: "admin@bus.com", password: "admin123", phone: "1234567890", isAdmin: true },
        { id: 2, name: "John Doe", email: "john@example.com", password: "john123", phone: "9876543210", isAdmin: false }
    ],
    buses: [
        { id: 1, registration: "NY1234", model: "Volvo AC", capacity: 50 },
        { id: 2, registration: "CA5678", model: "Scania Deluxe", capacity: 45 },
        { id: 3, registration: "TX9012", model: "Mercedes Luxury", capacity: 40 }
    ],
    routes: [
        { id: 1, origin: "New York", destination: "Boston", distance: "215 miles" },
        { id: 2, origin: "Los Angeles", destination: "San Francisco", distance: "383 miles" },
        { id: 3, origin: "Chicago", destination: "Detroit", distance: "283 miles" }
    ],
    schedules: [
        { id: 1, busId: 1, routeId: 1, departure: "08:00 AM", arrival: "01:30 PM", price: 50 },
        { id: 2, busId: 2, routeId: 2, departure: "09:00 AM", arrival: "04:00 PM", price: 65 },
        { id: 3, busId: 3, routeId: 3, departure: "07:30 AM", arrival: "12:30 PM", price: 45 }
    ],
    bookings: []
};

// Current user state
let currentUser = null;
let currentBooking = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();
    
    // Show home page by default
    showPage('home');
    
    // Check if user is logged in
    checkLoginStatus();
});

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(`${pageId}-page`).classList.add('active');
}

// Check login status
function checkLoginStatus() {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const adminLink = document.getElementById('admin-link');
    
    if (currentUser) {
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        logoutLink.style.display = 'block';
        if (currentUser.isAdmin) {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        loginLink.style.display = 'block';
        registerLink.style.display = 'block';
        logoutLink.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

// Login function
function login(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const user = sampleData.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        checkLoginStatus();
        showPage('home');
        alert('Login successful!');
    } else {
        alert('Invalid email or password');
    }
}

// Register function
function register(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    // Check if user already exists
    if (sampleData.users.some(u => u.email === email)) {
        alert('Email already registered');
        return;
    }
    
    // Create new user
    const newUser = {
        id: sampleData.users.length + 1,
        name,
        email,
        password,
        phone,
        isAdmin: false
    };
    
    sampleData.users.push(newUser);
    currentUser = newUser;
    checkLoginStatus();
    showPage('home');
    alert('Registration successful!');
}

// Logout function
function logout() {
    currentUser = null;
    checkLoginStatus();
    showPage('home');
}

// Search buses
function searchBuses(event) {
    event.preventDefault();
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;
    
    // In a real app, this would be an API call
    const results = sampleData.schedules.filter(schedule => {
        const route = sampleData.routes.find(r => r.id === schedule.routeId);
        return route.origin.toLowerCase().includes(origin.toLowerCase()) && 
               route.destination.toLowerCase().includes(destination.toLowerCase());
    });
    
    // Display results
    const busList = document.getElementById('bus-list');
    busList.innerHTML = '';
    
    if (results.length === 0) {
        busList.innerHTML = '<p>No buses found for your search criteria.</p>';
    } else {
        results.forEach(schedule => {
            const bus = sampleData.buses.find(b => b.id === schedule.busId);
            const route = sampleData.routes.find(r => r.id === schedule.routeId);
            
            const busItem = document.createElement('div');
            busItem.className = 'bus-item';
            busItem.innerHTML = `
                <h3>${bus.model}</h3>
                <p>Route: ${route.origin} to ${route.destination}</p>
                <p>Departure: ${schedule.departure}</p>
                <p>Arrival: ${schedule.arrival}</p>
                <p>Price: $${schedule.price}</p>
                <p>Available Seats: ${bus.capacity - sampleData.bookings.filter(b => b.scheduleId === schedule.id).length}</p>
                <a href="#" onclick="startBooking(${schedule.id})">Book Now</a>
            `;
            busList.appendChild(busItem);
        });
    }
    
    showPage('search-results');
}

// Start booking process
function startBooking(scheduleId) {
    const schedule = sampleData.schedules.find(s => s.id === scheduleId);
    const bus = sampleData.buses.find(b => b.id === schedule.busId);
    const route = sampleData.routes.find(r => r.id === schedule.routeId);
    
    currentBooking = {
        scheduleId,
        busId: bus.id,
        routeId: route.id,
        selectedSeats: [],
        price: schedule.price
    };
    
    // Display bus details
    const busDetails = document.getElementById('bus-details');
    busDetails.innerHTML = `
        <h3>${bus.model}</h3>
        <p>Route: ${route.origin} to ${route.destination}</p>
        <p>Date: ${document.getElementById('date').value}</p>
        <p>Departure: ${schedule.departure}</p>
    `;
    
    // Generate seat map
    const seatMap = document.getElementById('seat-map');
    seatMap.innerHTML = '';
    
    // Get booked seats for this schedule
    const bookedSeats = sampleData.bookings
        .filter(b => b.scheduleId === scheduleId)
        .flatMap(b => b.selectedSeats);
    
    // Create seats
    for (let i = 1; i <= bus.capacity; i++) {
        const seat = document.createElement('div');
        seat.className = bookedSeats.includes(i) ? 'seat booked' : 'seat';
        seat.textContent = i;
        seat.dataset.seat = i;
        seat.addEventListener('click', () => toggleSeatSelection(i, seat));
        seatMap.appendChild(seat);
    }
    
    showPage('booking-page');
}

// Toggle seat selection
function toggleSeatSelection(seatNumber, seatElement) {
    if (seatElement.classList.contains('booked')) return;
    
    const index = currentBooking.selectedSeats.indexOf(seatNumber);
    
    if (index === -1) {
        // Add seat to selection
        currentBooking.selectedSeats.push(seatNumber);
        seatElement.classList.add('selected');
    } else {
        // Remove seat from selection
        currentBooking.selectedSeats.splice(index, 1);
        seatElement.classList.remove('selected');
    }
    
    // Update summary
    document.getElementById('selected-seats-count').textContent = currentBooking.selectedSeats.length;
    document.getElementById('total-amount').textContent = currentBooking.selectedSeats.length * currentBooking.price;
    
    // Enable/disable proceed button
    document.getElementById('proceed-to-payment').disabled = currentBooking.selectedSeats.length === 0;
}

// Proceed to payment
document.getElementById('proceed-to-payment').addEventListener('click', function() {
    // Set up payment details
    const schedule = sampleData.schedules.find(s => s.id === currentBooking.scheduleId);
    const bus = sampleData.buses.find(b => b.id === currentBooking.busId);
    const route = sampleData.routes.find(r => r.id === currentBooking.routeId);
    
    const paymentDetails = document.getElementById('payment-details');
    paymentDetails.innerHTML = `
        <p>Bus: ${bus.model}</p>
        <p>Route: ${route.origin} to ${route.destination}</p>
        <p>Date: ${document.getElementById('date').value}</p>
        <p>Departure: ${schedule.departure}</p>
        <p>Seats: ${currentBooking.selectedSeats.join(', ')}</p>
        <p>Total: $${currentBooking.selectedSeats.length * currentBooking.price}</p>
    `;
    
    showPage('payment-page');
});

// Process payment
function processPayment(event) {
    event.preventDefault();
    
    // In a real app, this would process actual payment
    const bookingId = 'BUS' + Math.floor(100000 + Math.random() * 900000);
    
    // Create booking
    const newBooking = {
        id: bookingId,
        userId: currentUser.id,
        scheduleId: currentBooking.scheduleId,
        busId: currentBooking.busId,
        routeId: currentBooking.routeId,
        date: document.getElementById('date').value,
        seats: currentBooking.selectedSeats,
        totalAmount: currentBooking.selectedSeats.length * currentBooking.price,
        status: 'Confirmed'
    };
    
    sampleData.bookings.push(newBooking);
    
    // Generate ticket
    const schedule = sampleData.schedules.find(s => s.id === currentBooking.scheduleId);
    const bus = sampleData.buses.find(b => b.id === currentBooking.busId);
    const route = sampleData.routes.find(r => r.id === currentBooking.routeId);
    
    const ticket = document.getElementById('ticket');
    ticket.innerHTML = `
        <h3>E-Ticket</h3>
        <p>Booking ID: ${bookingId}</p>
        <p>Passenger: ${currentUser.name}</p>
        <p>Bus: ${bus.model}</p>
        <p>Route: ${route.origin} to ${route.destination}</p>
        <p>Date: ${newBooking.date}</p>
        <p>Departure: ${schedule.departure}</p>
        <p>Seats: ${newBooking.seats.join(', ')}</p>
        <p>Total Paid: $${newBooking.totalAmount}</p>
        <div class="qr-code">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${bookingId}" alt="QR Code">
        </div>
        <button onclick="window.print()" class="btn">Print Ticket</button>
    `;
    
    showPage('confirmation-page');
}

// Load user bookings
function loadUserBookings() {
    if (!currentUser) return;
    
    const bookingsList = document.getElementById('bookings-list');
    bookingsList.innerHTML = '';
    
    const userBookings = sampleData.bookings.filter(b => b.userId === currentUser.id);
    
    if (userBookings.length === 0) {
        bookingsList.innerHTML = '<p>You have no bookings yet.</p>';
    } else {
        userBookings.forEach(booking => {
            const schedule = sampleData.schedules.find(s => s.id === booking.scheduleId);
            const bus = sampleData.buses.find(b => b.id === booking.busId);
            const route = sampleData.routes.find(r => r.id === booking.routeId);
            
            const bookingItem = document.createElement('div');
            bookingItem.className = 'bus-item';
            bookingItem.innerHTML = `
                <h3>Booking #${booking.id}</h3>
                <p>Bus: ${bus.model}</p>
                <p>Route: ${route.origin} to ${route.destination}</p>
                <p>Date: ${booking.date}</p>
                <p>Departure: ${schedule.departure}</p>
                <p>Seats: ${booking.seats.join(', ')}</p>
                <p>Status: ${booking.status}</p>
                <a href="#" onclick="viewTicket('${booking.id}')">View Ticket</a>
                <button class="btn" onclick="cancelBooking('${booking.id}')">Cancel Booking</button>
            `;
            bookingsList.appendChild(bookingItem);
        });
    }
}

// View ticket
function viewTicket(bookingId) {
    const booking = sampleData.bookings.find(b => b.id === bookingId);
    const schedule = sampleData.schedules.find(s => s.id === booking.scheduleId);
    const bus = sampleData.buses.find(b => b.id === booking.busId);
    const route = sampleData.routes.find(r => r.id === booking.routeId);
    
    const ticket = document.getElementById('ticket');
    ticket.innerHTML = `
        <h3>E-Ticket</h3>
        <p>Booking ID: ${booking.id}</p>
        <p>Passenger: ${currentUser.name}</p>
        <p>Bus: ${bus.model}</p>
        <p>Route: ${route.origin} to ${route.destination}</p>
        <p>Date: ${booking.date}</p>
        <p>Departure: ${schedule.departure}</p>
        <p>Seats: ${booking.seats.join(', ')}</p>
        <p>Total Paid: $${booking.totalAmount}</p>
        <div class="qr-code">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${booking.id}" alt="QR Code">
        </div>
        <button onclick="window.print()" class="btn">Print Ticket</button>
    `;
    
    showPage('confirmation-page');
}

// Cancel booking
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const index = sampleData.bookings.findIndex(b => b.id === bookingId);
        if (index !== -1) {
            sampleData.bookings.splice(index, 1);
            loadUserBookings();
            alert('Booking cancelled successfully');
        }
    }
}

// Admin functions
function loadAdminBuses() {
    const busesTable = document.getElementById('buses-table');
    busesTable.innerHTML = '';
    
    sampleData.buses.forEach(bus => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${bus.id}</td>
            <td>${bus.registration}</td>
            <td>${bus.model}</td>
            <td>${bus.capacity}</td>
            <td>
                <button class="btn" onclick="editBus(${bus.id})">Edit</button>
                <button class="btn" onclick="deleteBus(${bus.id})">Delete</button>
            </td>
        `;
        busesTable.appendChild(row);
    });
}

// Show admin page
document.getElementById('admin-link')?.addEventListener('click', function() {
    loadAdminBuses();
    showPage('admin');
});

// Tab switching in admin dashboard
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // In a complete implementation, you would load the appropriate content for each tab
    });
});

// Initialize admin page
document.getElementById('admin-page')?.addEventListener('click', function(e) {
    if (e.target.id === 'add-bus') {
        // In a complete implementation, this would show a form to add a new bus
        alert('Add new bus functionality would go here');
    }
});

// Edit bus (placeholder)
function editBus(busId) {
    alert(`Edit bus ${busId} functionality would go here`);
}

// Delete bus (placeholder)
function deleteBus(busId) {
    if (confirm('Are you sure you want to delete this bus?')) {
        const index = sampleData.buses.findIndex(b => b.id === busId);
        if (index !== -1) {
            sampleData.buses.splice(index, 1);
            loadAdminBuses();
            alert('Bus deleted successfully');
        }
    }
}
