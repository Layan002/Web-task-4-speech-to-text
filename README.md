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

## "index.html" file:
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

## "styles.css"
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

## "script.js"
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

## "save_text.php"
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

## "fetch_value.php"
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
>
# Arduino IDE Code
In order to connect the hardware part to the web page, I've used the Arduino IDE. This is the code: 
``` CPP
/**
 * BasicHTTPClient.ino
 *
 *  Created on: 24.05.2015
 *
 */

#include <Arduino.h>

#include <WiFi.h>
#include <WiFiMulti.h>

#include <HTTPClient.h>

#define USE_SERIAL Serial

WiFiMulti wifiMulti;

/*
const char* ca = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIEkjCCA3qgAwIBAgIQCgFBQgAAAVOFc2oLheynCDANBgkqhkiG9w0BAQsFADA/\n" \
"MSQwIgYDVQQKExtEaWdpdGFsIFNpZ25hdHVyZSBUcnVzdCBDby4xFzAVBgNVBAMT\n" \
"DkRTVCBSb290IENBIFgzMB4XDTE2MDMxNzE2NDA0NloXDTIxMDMxNzE2NDA0Nlow\n" \
"SjELMAkGA1UEBhMCVVMxFjAUBgNVBAoTDUxldCdzIEVuY3J5cHQxIzAhBgNVBAMT\n" \
"GkxldCdzIEVuY3J5cHQgQXV0aG9yaXR5IFgzMIIBIjANBgkqhkiG9w0BAQEFAAOC\n" \
"AQ8AMIIBCgKCAQEAnNMM8FrlLke3cl03g7NoYzDq1zUmGSXhvb418XCSL7e4S0EF\n" \
"q6meNQhY7LEqxGiHC6PjdeTm86dicbp5gWAf15Gan/PQeGdxyGkOlZHP/uaZ6WA8\n" \
"SMx+yk13EiSdRxta67nsHjcAHJyse6cF6s5K671B5TaYucv9bTyWaN8jKkKQDIZ0\n" \
"Z8h/pZq4UmEUEz9l6YKHy9v6Dlb2honzhT+Xhq+w3Brvaw2VFn3EK6BlspkENnWA\n" \
"a6xK8xuQSXgvopZPKiAlKQTGdMDQMc2PMTiVFrqoM7hD8bEfwzB/onkxEz0tNvjj\n" \
"/PIzark5McWvxI0NHWQWM6r6hCm21AvA2H3DkwIDAQABo4IBfTCCAXkwEgYDVR0T\n" \
"AQH/BAgwBgEB/wIBADAOBgNVHQ8BAf8EBAMCAYYwfwYIKwYBBQUHAQEEczBxMDIG\n" \
"CCsGAQUFBzABhiZodHRwOi8vaXNyZy50cnVzdGlkLm9jc3AuaWRlbnRydXN0LmNv\n" \
"bTA7BggrBgEFBQcwAoYvaHR0cDovL2FwcHMuaWRlbnRydXN0LmNvbS9yb290cy9k\n" \
"c3Ryb290Y2F4My5wN2MwHwYDVR0jBBgwFoAUxKexpHsscfrb4UuQdf/EFWCFiRAw\n" \
"VAYDVR0gBE0wSzAIBgZngQwBAgEwPwYLKwYBBAGC3xMBAQEwMDAuBggrBgEFBQcC\n" \
"ARYiaHR0cDovL2Nwcy5yb290LXgxLmxldHNlbmNyeXB0Lm9yZzA8BgNVHR8ENTAz\n" \
"MDGgL6AthitodHRwOi8vY3JsLmlkZW50cnVzdC5jb20vRFNUUk9PVENBWDNDUkwu\n" \
"Y3JsMB0GA1UdDgQWBBSoSmpjBH3duubRObemRWXv86jsoTANBgkqhkiG9w0BAQsF\n" \
"AAOCAQEA3TPXEfNjWDjdGBX7CVW+dla5cEilaUcne8IkCJLxWh9KEik3JHRRHGJo\n" \
"uM2VcGfl96S8TihRzZvoroed6ti6WqEBmtzw3Wodatg+VyOeph4EYpr/1wXKtx8/\n" \
"wApIvJSwtmVi4MFU5aMqrSDE6ea73Mj2tcMyo5jMd6jmeWUHK8so/joWUoHOUgwu\n" \
"X4Po1QYz+3dszkDqMp4fklxBwXRsW10KXzPMTZ+sOPAveyxindmjkW8lGy+QsRlG\n" \
"PfZ+G6Z6h7mjem0Y+iWlkYcV4PIWL1iwBi8saCbGS5jN2p8M+X+Q7UNKEkROb3N6\n" \
"KOqkqm57TH2H3eDJAkSnh6/DNFu0Qg==\n" \
"-----END CERTIFICATE-----\n";
*/

#define LED_BUILTIN 2  
void setup() {
  
  USE_SERIAL.begin(115200);

  pinMode(LED_BUILTIN, OUTPUT);

  USE_SERIAL.println();
  USE_SERIAL.println();
  USE_SERIAL.println();

  for (uint8_t t = 4; t > 0; t--) {
    USE_SERIAL.printf("[SETUP] WAIT %d...\n", t);
    USE_SERIAL.flush();
    delay(1000);
  }

  wifiMulti.addAP("ABDULLATIF", "Aa0506375183");
}

void loop() {
  // wait for WiFi connection
  if ((wifiMulti.run() == WL_CONNECTED)) {

    HTTPClient http;

    USE_SERIAL.print("[HTTP] begin...\n");
    // configure traged server and url
    //http.begin("https://www.howsmyssl.com/a/check", ca); //HTTPS
    http.begin("http://192.168.1.9/speech-to-text/fetch_value.php");  //HTTP

    USE_SERIAL.print("[HTTP] GET...\n");
    // start connection and send HTTP header
    int httpCode = http.GET();

    // httpCode will be negative on error
    if (httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      USE_SERIAL.printf("[HTTP] GET... code: %d\n", httpCode);

      // file found at server
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        USE_SERIAL.println(payload);
        if (payload == "1") {
          digitalWrite(LED_BUILTIN, HIGH);
        }
        else if (payload == "0"){
          digitalWrite(LED_BUILTIN, LOW);
        }
      }
    } else {
      USE_SERIAL.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  }

  delay(1000);
}
```
>[!CAUTION]
>Be careful for the type of payload which it is a string so writing 0 and 1 won't work, instead, write "0" and "1" inside the if statement. 

# Testing Video 

