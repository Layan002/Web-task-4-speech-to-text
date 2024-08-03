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

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $speechText = trim($_POST['speech-text']);

    if ($speechText === '1' || $speechText === '0') {
        $sql = "INSERT INTO recordings (text) VALUES ('$speechText')";
        if ($conn->query($sql) === TRUE) {
            echo "New record created successfully";
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    } else {
        echo "Invalid command. Only 'open' or 'close' are accepted.";
    }

    $conn->close();
}
?>
