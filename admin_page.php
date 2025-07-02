<?php
$host = "localhost";
$user = "root";
$password = "";
$dbname = "bus_booking";

$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Handle bus submission
if (isset($_POST['add_bus'])) {
    $bus_number = $_POST['bus_number'];
    $bus_type = $_POST['bus_type'];
    $total_seats = $_POST['total_seats'];

    $conn->query("INSERT INTO buses (bus_number, bus_type, total_seats) VALUES ('$bus_number', '$bus_type', $total_seats)");
}

// Handle route submission
if (isset($_POST['add_route'])) {
    $origin = $_POST['origin'];
    $destination = $_POST['destination'];
    $departure_time = $_POST['departure_time'];
    $arrival_time = $_POST['arrival_time'];
    $bus_id = $_POST['bus_id'];

    $conn->query("INSERT INTO routes (origin, destination, departure_time, arrival_time, bus_id)
                  VALUES ('$origin', '$destination', '$departure_time', '$arrival_time', $bus_id)");
}

// Fetch buses for dropdown
$buses = $conn->query("SELECT id, bus_number FROM buses");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Admin Panel - Add Buses & Routes</title>
</head>
<body>
    <h2>Add Bus</h2>
    <form method="post">
        Bus Number: <input type="text" name="bus_number" required><br>
        Bus Type: <input type="text" name="bus_type"><br>
        Total Seats: <input type="number" name="total_seats" required><br>
        <button type="submit" name="add_bus">Add Bus</button>
    </form>

    <hr>

    <h2>Add Route</h2>
    <form method="post">
        Origin: <input type="text" name="origin" required><br>
        Destination: <input type="text" name="destination" required><br>
        Departure Time: <input type="datetime-local" name="departure_time" required><br>
        Arrival Time: <input type="datetime-local" name="arrival_time" required><br>
        Select Bus:
        <select name="bus_id" required>
            <option value="">Select Bus</option>
            <?php while($row = $buses->fetch_assoc()): ?>
                <option value="<?= $row['id'] ?>"><?= $row['bus_number'] ?></option>
            <?php endwhile; ?>
        </select><br>
        <button type="submit" name="add_route">Add Route</button>
    </form>
</body>
</html>
