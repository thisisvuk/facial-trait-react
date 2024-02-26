import React, { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

const MyWebcamComponent = () => {
  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  return (
    <div>
      <Webcam
      audio={false}
      height={720}
      screenshotFormat="image/jpeg"
      width={1280}
      videoConstraints={videoConstraints}
    >
      {({ getScreenshot }) => (
        <button
          onClick={() => {
            const imageSrc = getScreenshot()
          }}
        >
          Capture photo
        </button>
      )}
    </Webcam>
    </div>
  );
};

export default MyWebcamComponent;
