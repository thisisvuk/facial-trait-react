import React, { useRef, useState,useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const FacePositionValidator = () => {
  const webcamRef = useRef(null);
  const [isPositionedCorrectly, setIsPositionedCorrectly] = useState(false);

  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadFaceApi = async () => {
      await faceapi.nets.tinyYolov2.loadFromUri('/models');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      setModelsLoaded(true);
    };

    loadFaceApi(); // Call the function when the component mounts
  }, []);

  const capture = async (imageSrc) => {
    if (!modelsLoaded) {
      console.error('Models not loaded yet. Cannot capture.');
      return;
    }
    const img = new Image();
    img.src = imageSrc;
  
    const detections = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
  
    if (detections) {
      // You may need to adjust these thresholds based on your use case
      const isFaceCentered = Math.abs(detections.landmarks.getNose().x - img.width / 2) < 50;
      const isFaceVisible = detections.detection._score > 0.5;
  
      setIsPositionedCorrectly(isFaceCentered && isFaceVisible);
    } else {
      setIsPositionedCorrectly(false);
    }
  };
  

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  return (
    <div>
      <Webcam
      audio={false}
      height={300}
      screenshotFormat="image/jpeg"
      width={400}
      videoConstraints={videoConstraints}
    >
      {({ getScreenshot }) => (
        <button
          onClick={() => {
            const imageSrc = getScreenshot()
            capture(imageSrc)
          }}
        >
          Capture photo
        </button>
      )}
    </Webcam>
      {isPositionedCorrectly ? (
        <p>User positioned correctly! Redirecting to home page...</p>
      ) : (
        <p>Please adjust your face position for proper validation.</p>
      )}
    </div>
  );
};

export default FacePositionValidator;
