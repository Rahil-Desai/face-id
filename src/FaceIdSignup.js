import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = process.env.PUBLIC_URL + '/models';
const REQUIRED_PHOTOS = 10;

export default function FaceIdSignup() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      setStatus('Loading AI models...');
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setLoading(false);
        setStatus('Models loaded. Please allow camera access to start registration.');
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
        setCameraStarted(true);
        setStatus('Camera started. Position your face in the circle and click "Capture Photo".');
      })
      .catch(() => setStatus('Camera access denied. Please allow camera permissions.'));
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    setStatus('Capturing photo...');
    
    try {
      // Create canvas and draw video frame
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      // Detect face in the captured image
      const detection = await faceapi.detectSingleFace(
        canvas,
        new faceapi.TinyFaceDetectorOptions()
      );
      
      if (detection) {
        // Convert canvas to blob
        canvas.toBlob((blob) => {
          const photoUrl = URL.createObjectURL(blob);
          setCapturedPhotos(prev => [...prev, photoUrl]);
          
          const newCount = capturedPhotos.length + 1;
          setStatus(`Photo ${newCount}/${REQUIRED_PHOTOS} captured successfully!`);
          
          if (newCount >= REQUIRED_PHOTOS) {
            setStatus('All photos captured! Click "Complete Registration" to finish.');
          } else {
            setStatus(`Photo ${newCount}/${REQUIRED_PHOTOS} captured. Please move your head slightly and capture another photo.`);
          }
        }, 'image/jpeg', 0.8);
      } else {
        setStatus('No face detected. Please position your face in the circle and try again.');
      }
    } catch (error) {
      setStatus('Error capturing photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const completeRegistration = () => {
    setRegistrationComplete(true);
    setStatus('Registration completed successfully! Your face ID is now set up.');
  };

  const resetRegistration = () => {
    setCapturedPhotos([]);
    setRegistrationComplete(false);
    setStatus('Registration reset. Click "Start Camera" to begin again.');
  };

  const getProgressPercentage = () => {
    return (capturedPhotos.length / REQUIRED_PHOTOS) * 100;
  };

  const getStatusClass = () => {
    if (loading) return 'status-loading';
    if (registrationComplete) return 'status-success';
    if (status.includes('Error') || status.includes('denied')) return 'status-error';
    return 'status-info';
  };

  return (
    <div className="face-id-container">
      <h2 className="component-title">Face ID Registration</h2>
      
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          muted
          width={320}
          height={240}
          className="video-element"
        />
        {cameraStarted && !registrationComplete && (
          <div className="camera-overlay"></div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      
      {/* Progress Bar */}
      {capturedPhotos.length > 0 && (
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      )}
      
      {/* Photo Grid */}
      {capturedPhotos.length > 0 && (
        <div className="photo-grid">
          {Array.from({ length: REQUIRED_PHOTOS }, (_, index) => (
            <div 
              key={index} 
              className={`photo-item ${index < capturedPhotos.length ? 'captured' : ''}`}
            >
              {index < capturedPhotos.length && (
                <img src={capturedPhotos[index]} alt={`Photo ${index + 1}`} />
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="button-group">
        {!cameraStarted && (
          <button 
            onClick={startVideo} 
            disabled={loading} 
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
        )}
        
        {cameraStarted && !registrationComplete && (
          <>
            <button 
              onClick={capturePhoto} 
              disabled={isCapturing || capturedPhotos.length >= REQUIRED_PHOTOS} 
              className="btn btn-secondary"
            >
              {isCapturing ? (
                <>
                  <span className="spinner"></span>
                  Capturing...
                </>
              ) : (
                `Capture Photo (${capturedPhotos.length}/${REQUIRED_PHOTOS})`
              )}
            </button>
            
            {capturedPhotos.length >= REQUIRED_PHOTOS && (
              <button 
                onClick={completeRegistration} 
                className="btn btn-success"
              >
                Complete Registration
              </button>
            )}
          </>
        )}
        
        {registrationComplete && (
          <button 
            onClick={resetRegistration} 
            className="btn btn-primary"
          >
            Register Another Face
          </button>
        )}
      </div>
      
      <div className={`status-message ${getStatusClass()}`}>
        {status}
      </div>
      
      {capturedPhotos.length > 0 && capturedPhotos.length < REQUIRED_PHOTOS && (
        <div className="status-message status-info">
          <strong>Tip:</strong> Move your head to different angles (left, right, up, down) to capture a variety of poses for better recognition.
        </div>
      )}
    </div>
  );
} 