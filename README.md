# Starting 
I've created a web page that contains a recording request to take input from the user to weather "open" or "close" the lamp. 

# Components 
I've used the following electronics components:
- ESP32
- Arduino UNO
- Relay SRD-05VDC-SL-C
- Jumper wires
- Powerbank (opttional)

# Codes

To complete this task, I've written 5 files codes: html, css, php and js. I put them all inside the path of "C:\xampp\htdocs\speech-to-text".<br>
"speech-to-text" is the directory I've created to contail all coded files. 

- "index.html" file:
``` HTML
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Speech to Text</title>
    <link rel="stylesheet" href="styles.css" />
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  </head>
  <body>
    <h1>Speech to Text</h1>
    <button id="start-record-btn">Start Recording</button>
    <p id="recording-text"></p>
    <form id="speech-form" action="save_text.php" method="POST">
      <input type="hidden" id="speech-text" name="speech-text" />
      <button type="submit">Save Text</button>
    </form>
    <p id="response-message"></p>

    <script src="script.js"></script>
  </body>
</html>

```

- "styles.css"
``` CSS
body {
    font-family: Arial, sans-serif;
    text-align: center;
    margin: 50px;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    margin: 10px;
}

#recording-text {
    margin-top: 20px;
    font-size: 20px;
}
```

- "script.js"
``` JS
document.addEventListener('DOMContentLoaded', function() {
    const startRecordBtn = document.getElementById('start-record-btn');
    const recordingText = document.getElementById('recording-text');
    const speechTextInput = document.getElementById('speech-text');
    const responseMessage = document.getElementById('response-message');
    const form = document.getElementById('speech-form');

    // Check if the browser supports the Web Speech API
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        startRecordBtn.addEventListener('click', () => {
            recognition.start();
            startRecordBtn.disabled = true;
            startRecordBtn.textContent = 'Recording...';
        });

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript.trim().toLowerCase();
                if (event.results[i].isFinal) {
                    if (transcript === 'open') {
                        recordingText.textContent = transcript;
                        speechTextInput.value = 1; // Save as 1
                    } else if (transcript === 'close') {
                        recordingText.textContent = transcript;
                        speechTextInput.value = 0; // Save as 0
                    } else {
                        recordingText.textContent = 'Invalid command. Please say "open" or "close".';
                        speechTextInput.value = '';
                    }
                } else {
                    interimTranscript += transcript;
                }
            }
        };

        recognition.onend = () => {
            startRecordBtn.disabled = false;
            startRecordBtn.textContent = 'Start Recording';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error detected: ' + event.error);
            startRecordBtn.disabled = false;
            startRecordBtn.textContent = 'Start Recording';
        };

        // Handle form submission with AJAX
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            $.ajax({
                type: 'POST',
                url: form.action,
                data: $(form).serialize(),
                success: function(response) {
                    responseMessage.textContent = response;
                    recordingText.textContent = '';
                    speechTextInput.value = '';
                    recognition.stop(); // Stop the microphone after saving
                },
                error: function() {
                    responseMessage.textContent = 'An error occurred while saving the text.';
                    recognition.stop(); // Stop the microphone in case of error
                }
            });
        });
    } else {
        console.warn('Web Speech API is not supported by this browser.');
        startRecordBtn.disabled = true;
    }
});
```

- "save_text.php"
``` PHP
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
```

- "fetch_value.php"
``` PHP
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
```
>[!NOTE]
>Do not forget to start apache and mysql in xampp. In addition, creating a database called "speech-to-text" and table called "Recordings" with two coloumns: ID (int) and text (int).


