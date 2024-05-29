import React, { useState } from 'react';

export const AudioRecorder = () => {
    const [displayText, setDisplayText] = useState('INITIALIZED: ready to test speech...');
    const [audioFile, setAudioFile] = useState(null);

    async function recordAudio() {
        setDisplayText('Initializing microphone...');

        try {
            // Request access to the microphone
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            let audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioFile(audioUrl);
                setDisplayText('Audio recording complete.');
                console.log('Audio URL:', audioUrl);
            };

            mediaRecorder.start();
            setDisplayText('Recording... speak into your microphone.');

            // Stop recording after 5 seconds (5000 ms)
            setTimeout(() => {
                mediaRecorder.stop();
                setDisplayText('Stopping recording...');
            }, 5000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setDisplayText('ERROR: Unable to access microphone.');
        }
    }

    return (
        <div>
            <p>{displayText}</p>
            <button onClick={recordAudio}>Start Recording</button>
            {audioFile && <audio src={audioFile} controls />}
        </div>
    );
};

export default AudioRecorder;
