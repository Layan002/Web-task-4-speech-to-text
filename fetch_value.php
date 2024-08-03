<?php
// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "speech_to_text";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL query to get the latest entry
$query = "SELECT text FROM recordings ORDER BY id DESC LIMIT 1";

// Execute the query
$result = $conn->query($query);

if ($result) {
    $row = $result->fetch_assoc();
    echo $row['text'];
} else {
    echo "Error: " . $conn->error;
}

// Close the connection
$conn->close();
?>
