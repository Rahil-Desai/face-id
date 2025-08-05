import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = process.env.PUBLIC_URL + '/models';

export default function FaceIdLogin() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      setStatus('Loading AI models...');
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setLoading(false);
        setStatus('Models loaded. Please allow camera access.');
      } catch (error) {
        setStatus('Error loading models. Please refresh the page.');
        setLoading(false);
      }
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
      .catch(() => setStatus('Camera access denied. Please allow camera permissions.'));
  };

  const handleLogin = async () => {
    if (!videoRef.current) return;
    
    setIsProcessing(true);
    setStatus('Detecting face...');
    
    try {
      const detection = await faceapi.detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      );
      
      if (detection) {
        setFaceDetected(true);
        setStatus('Face detected! Login successful.');
      } else {
        setStatus('No face detected. Please look directly at the camera.');
      }
    } catch (error) {
      setStatus('Error detecting face. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetLogin = () => {
    setFaceDetected(false);
    setStatus('Ready to login. Click "Start Camera" to begin.');
  };

  const getStatusClass = () => {
    if (loading) return 'status-loading';
    if (faceDetected) return 'status-success';
    if (status.includes('Error') || status.includes('denied')) return 'status-error';
    return 'status-info';
  };

  return (
    <div className="face-id-container">
      <h2 className="component-title">Face ID Login</h2>
      
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          width={320}
          height={240}
          className="video-element"
        />
        {!loading && !faceDetected && (
          <div className="camera-overlay"></div>
        )}
      </div>
      
      <div className="button-group">
        <button 
          onClick={startVideo} 
          disabled={loading || faceDetected} 
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Loading...
            </>
          ) : (
            'Start Camera'
          )}
        </button>
        
        <button 
          onClick={handleLogin} 
          disabled={loading || faceDetected || isProcessing} 
          className="btn btn-secondary"
        >
          {isProcessing ? (
            <>
              <span className="spinner"></span>
              Processing...
            </>
          ) : (
            'Login with Face ID'
          )}
        </button>
        
        {faceDetected && (
          <button 
            onClick={resetLogin} 
            className="btn btn-success"
          >
            Login Again
          </button>
        )}
      </div>
      
      <div className={`status-message ${getStatusClass()}`}>
        {status}
      </div>
    </div>
  );
} 