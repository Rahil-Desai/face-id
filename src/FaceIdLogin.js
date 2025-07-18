import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = process.env.PUBLIC_URL + '/models';

export default function FaceIdLogin() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      setStatus('Loading AI models...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      setLoading(false);
      setStatus('Models loaded. Please allow camera access.');
    };
    loadModels();
  }, []);

  const startVideo = () => {
    setStatus('Starting camera...');
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setStatus('Camera started. Look at the camera and click Login.');
      })
      .catch(() => setStatus('Camera access denied.'));
  };

  const handleLogin = async () => {
    setStatus('Detecting face...');
    const detection = await faceapi.detectSingleFace(
      videoRef.current,
      new faceapi.TinyFaceDetectorOptions()
    );
    if (detection) {
      setFaceDetected(true);
      setStatus('Face detected! Login successful.');
    } else {
      setStatus('No face detected. Try again.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      <h2>Face ID Login</h2>
      <video
        ref={videoRef}
        autoPlay
        muted
        width={320}
        height={240}
        style={{ border: '1px solid #ccc', borderRadius: 8, marginBottom: 16 }}
      />
      <div style={{ marginBottom: 16 }}>
        <button onClick={startVideo} disabled={loading || faceDetected} style={{ marginRight: 8 }}>
          Start Camera
        </button>
        <button onClick={handleLogin} disabled={loading || faceDetected}>
          Login with Face ID
        </button>
      </div>
      <div style={{ minHeight: 24, color: faceDetected ? 'green' : 'black' }}>{status}</div>
    </div>
  );
} 