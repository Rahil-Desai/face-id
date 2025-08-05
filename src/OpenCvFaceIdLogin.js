import React, { useRef, useEffect, useState } from 'react';

export default function OpenCvFaceIdLogin() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('');
  const [opencvLoaded, setOpencvLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  // Load OpenCV.js
  useEffect(() => {
    if (window.cv) {
      setOpencvLoaded(true);
      return;
    }
    setStatus('Loading OpenCV.js...');
    const script = document.createElement('script');
    script.src = process.env.PUBLIC_URL + '/opencv.js';
    script.async = true;
    script.onload = () => {
      setStatus('OpenCV.js loaded.');
      setOpencvLoaded(true);
    };
    script.onerror = () => setStatus('Failed to load OpenCV.js');
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Start webcam
  const startVideo = () => {
    setStatus('Starting camera...');
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setStatus('Camera started.');
      })
      .catch(() => setStatus('Camera access denied.'));
  };

  // Load Haar Cascade and detect faces
  const handleLogin = async () => {
    setStatus('Detecting face...');
    if (!window.cv) {
      setStatus('OpenCV.js not loaded.');
      return;
    }
    // Load the cascade
    const cascadeFile = 'haarcascade_frontalface_default.xml';
    const cascadeUrl = process.env.PUBLIC_URL + '/' + cascadeFile;
    const response = await fetch(cascadeUrl);
    const data = await response.arrayBuffer();
    window.cv.FS_createDataFile('/', cascadeFile, new Uint8Array(data), true, false, false);
    const classifier = new window.cv.CascadeClassifier();
    classifier.load(cascadeFile);

    // Start detection loop
    const detect = () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      let src = new window.cv.Mat(canvas.height, canvas.width, window.cv.CV_8UC4);
      let gray = new window.cv.Mat();
      src.data.set(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
      window.cv.cvtColor(src, gray, window.cv.COLOR_RGBA2GRAY);
      let faces = new window.cv.RectVector();
      classifier.detectMultiScale(gray, faces, 1.1, 3, 0);
      if (faces.size() > 0) {
        setFaceDetected(true);
        setStatus('Face detected! Login successful.');
        clearInterval(intervalId);
        // Draw rectangle
        for (let i = 0; i < faces.size(); i++) {
          let face = faces.get(i);
          ctx.strokeStyle = 'green';
          ctx.lineWidth = 2;
          ctx.strokeRect(face.x, face.y, face.width, face.height);
        }
      } else {
        setStatus('No face detected. Try again.');
      }
      src.delete();
      gray.delete();
      faces.delete();
    };
    setStatus('Detecting...');
    const id = setInterval(detect, 500);
    setIntervalId(id);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
      <h2>OpenCV.js Face ID Login</h2>
      <video
        ref={videoRef}
        autoPlay
        muted
        width={320}
        height={240}
        style={{ border: '1px solid #ccc', borderRadius: 8, marginBottom: 8 }}
      />
      <canvas
        ref={canvasRef}
        width={320}
        height={240}
        style={{ position: 'absolute', display: 'none' }}
      />
      <div style={{ marginBottom: 16 }}>
        <button onClick={startVideo} disabled={!opencvLoaded || faceDetected} style={{ marginRight: 8 }}>
          Start Camera
        </button>
        <button onClick={handleLogin} disabled={!opencvLoaded || faceDetected}>
          Login with Face ID
        </button>
      </div>
      <div style={{ minHeight: 24, color: faceDetected ? 'green' : 'black' }}>{status}</div>
      <div style={{ fontSize: 12, marginTop: 8 }}>
        (Requires <code>opencv.js</code> and <code>haarcascade_frontalface_default.xml</code> in <code>public/</code> folder)
      </div>
    </div>
  );
} 