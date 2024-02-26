import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const FacePositionValidator = () => {
  const webcamRef = useRef(null);
  const [isPositionedCorrectly, setIsPositionedCorrectly] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestDone, setIsTestDone] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + "/models";

      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).then(setModelsLoaded(true));
    };

    loadModels();
  }, []);

  const capture = async (imageSrc) => {
    if (!modelsLoaded) {
      console.error("Models not loaded yet. Cannot capture");
      return;
    }

    setIsLoading(true);

    const img = new Image();

    img.onload = async () => {
      const detections = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (
        detections &&
        detections.landmarks &&
        detections.landmarks.getNose()
      ) {
        const noseX = detections.landmarks.getNose()[0].x;
        const imageWidth = img.width;

        console.log("Nose X:", noseX);
        console.log("Image Width:", imageWidth);

        const isFaceCentered = Math.abs(noseX - imageWidth / 2) < 100;
        const isFaceVisible = detections.detection._score > 0.5;

        console.log("Difference:", Math.abs(noseX - imageWidth / 2));
        console.log("Is Face Centered:", isFaceCentered);
        console.log("Is Face Visible:", isFaceVisible);

        setIsPositionedCorrectly(isFaceCentered && isFaceVisible);
      } else {
        console.error("Nose position not detected or landmarks not available.");
        setIsPositionedCorrectly(false);
      }
      setIsLoading(false);
      setIsTestDone(true);
    };

    img.src = imageSrc;
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center">
      {console.log({isPositionedCorrectly})}
      {!isPositionedCorrectly && !isTestDone ? (
        <Webcam
        className="mx-auto w-100 h-2/4 bg-black rounded-2xl"
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      >
        {({ getScreenshot }) => (
          <button
            className="mt-5 bg-yellow-500 py-2 px-5 w-fit rounded-lg"
            onClick={() => {
              const imageSrc = getScreenshot();
              capture(imageSrc);
            }}
          >
            Capture photo
          </button>
        )}
      </Webcam>
      ) : (
        <p></p>
      )}

      
      
      <p className="pt-2">{isLoading ? `Please wait...` : `` }</p>
      
      {
        !isPositionedCorrectly && <p className="py-3">
          Please adjust your face position for proper validation.
      </p>
      }
      
      {
        isPositionedCorrectly && <p className="py-3 text-2xl text-green-900 font-bold">
          You're in home.
      </p>
      }
           
      {isTestDone && (
        <button
          className="mt-5 bg-yellow-500 py-2 px-5 w-fit rounded-lg"
          onClick={()  => {setIsPositionedCorrectly(false); setIsTestDone(false);}}
        >
          Go Back
        </button>
      )}
    </div>
  );
};

export default FacePositionValidator;
