import React, { useState } from "react";

const CONTAINER_NAME = "audios";

export const AudioRecorder = () => {
  const [displayText, setDisplayText] = useState(
    "INITIALIZED: ready to test speech..."
  );
  const [audioFile, setAudioFile] = useState(null);

  async function recordAudio() {
    setDisplayText("Initializing microphone...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      let audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        setDisplayText("Uploading audio...");

        try {
          const temporaryUrl = await uploadToAzureBlobStorage(audioBlob);
          setAudioFile(temporaryUrl);
          setDisplayText("Audio recording complete.");
        } catch (error) {
          setDisplayText("ERROR: Unable to upload audio.");
          console.error("Error uploading audio:", error);
        }
      };

      mediaRecorder.start();
      setDisplayText("Recording... speak into your microphone.");

      // Stop recording after 5 seconds (5000 ms)
      setTimeout(() => {
        mediaRecorder.stop();
        setDisplayText("Stopping recording...");
      }, 5000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setDisplayText("ERROR: Unable to access microphone.");
    }
  }

    
  const uploadToAzureBlobStorage = async (blob) => {
    const containerName = CONTAINER_NAME;
    const blobName = `audio-${Date.now()}.wav`;
    const url = `https://interviewgenie.blob.core.windows.net/${containerName}/${blobName}`;

    // Generate SAS token for the container
    const sasToken = "sp=rw&st=2024-05-29T12:17:09Z&se=2025-05-28T20:17:09Z&spr=https&sv=2022-11-02&sr=c&sig=fgpO5w0qfU9TQqdDRMGrpcbN%2B6t5Q%2BOM6%2BH8rH9ekrc%3D";
    // console.log(sasToken);

    try {
      const response = await fetch(`${url}?${sasToken}`, {
        method: "PUT",
        headers: {
          "Content-Type": "audio/wav",
          "x-ms-blob-type": "BlockBlob",
          "x-ms-blob-content-type": "audio/wav",
          "x-ms-blob-content-disposition": `inline; filename="${blobName}"`,
        },
        body: blob,
      });

      if (response.ok) {
        return response.url;
      } else {
        throw new Error("Failed to upload audio to Azure Blob Storage.");
      }
    } catch (error) {
      throw new Error(`Error uploading audio: ${error.message}`);
    }
  };

  return (
    <div>
      <p>{displayText}</p>
      <button onClick={recordAudio}>Start Recording</button>
      {audioFile && <audio src={audioFile} controls />}
    </div>
  );
};

export default AudioRecorder;
