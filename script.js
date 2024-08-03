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
