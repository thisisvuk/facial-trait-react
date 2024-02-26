import React, { useRef, useState,useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const FacePositionValidator = () => {
  const webcamRef = useRef(null);
  const [isPositionedCorrectly, setIsPositionedCorrectly] = useState(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    }

    loadModels();

  }, []);

  const capture = async (imageSrc) => {
    if (!modelsLoaded || !webcamRef.current) {
      console.error('Models not loaded yet or webcam not initialized.');
      return;
    }
  
    const img = new Image();
  
    img.onload = async () => {
      const detections = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
  
      if (detections && detections.landmarks && detections.landmarks.getNose()) {
        const noseX = detections.landmarks.getNose()[0].x;
        const imageWidth = img.width;
  
        console.log('Nose X:', noseX);
        console.log('Image Width:', imageWidth);
  
        const isFaceCentered = Math.abs(noseX - imageWidth / 2) < 50;
        const isFaceVisible = detections.detection._score > 0.5;
  
        console.log('Difference:', Math.abs(noseX - imageWidth / 2));
        console.log('Is Face Centered:', isFaceCentered);
        console.log('Is Face Visible:', isFaceVisible);
  
        setIsPositionedCorrectly(isFaceCentered && isFaceVisible);
      } else {
        console.error('Nose position not detected or landmarks not available.');
        setIsPositionedCorrectly(false);
      }
    };
  
    img.src = imageSrc;
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
