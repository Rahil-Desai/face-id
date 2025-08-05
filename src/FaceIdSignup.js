import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = process.env.PUBLIC_URL + '/models';
const REQUIRED_PHOTOS = 200;
const CAPTURE_INTERVAL = 100; // 100ms = 10 photos per second

export default function FaceIdSignup() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isHoldingButton, setIsHoldingButton] = useState(false);
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      setStatus('Loading AI models...');
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setLoading(false);
        setStatus('Models loaded. Please enter your name to start registration.');
      } catch (error) {
        setStatus('Error loading models. Please refresh the page.');
        setLoading(false);
      }
    };
    loadModels();
  }, []);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setShowNameInput(false);
      setStatus('Name saved. Please allow camera access to start registration.');
    } else {
      setStatus('Please enter your name to continue.');
    }
  };

  const startVideo = () => {
    setStatus('Starting camera...');
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setCameraStarted(true);
        setStatus(`Camera started. Hold the "Capture Photos" button to automatically capture 200 photos for ${userName}.`);
      })
      .catch(() => setStatus('Camera access denied. Please allow camera permissions.'));
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
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
          
          if (newCount >= REQUIRED_PHOTOS) {
            stopCapturing();
            setStatus(`All 200 photos captured for ${userName}! Click "Complete Registration" to finish.`);
          } else {
            setStatus(`Photo ${newCount}/${REQUIRED_PHOTOS} captured automatically for ${userName}. Keep holding for more photos.`);
          }
        }, 'image/jpeg', 0.8);
      } else {
        setStatus('No face detected. Please position your face in the circle and try again.');
      }
    } catch (error) {
      setStatus('Error capturing photo. Please try again.');
    }
  };

  const startCapturing = () => {
    if (capturedPhotos.length >= REQUIRED_PHOTOS) return;
    
    setIsHoldingButton(true);
    setIsCapturing(true);
    setStatus('Capturing photos automatically... Keep holding the button.');
    
    // Start automatic capture interval
    captureIntervalRef.current = setInterval(() => {
      if (capturedPhotos.length < REQUIRED_PHOTOS) {
        capturePhoto();
      } else {
        stopCapturing();
      }
    }, CAPTURE_INTERVAL);
  };

  const stopCapturing = () => {
    setIsHoldingButton(false);
    setIsCapturing(false);
    
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    
    if (capturedPhotos.length >= REQUIRED_PHOTOS) {
      setStatus(`All 200 photos captured for ${userName}! Click "Complete Registration" to finish.`);
    } else {
      setStatus(`Captured ${capturedPhotos.length}/${REQUIRED_PHOTOS} photos for ${userName}. Hold the button again to capture more.`);
    }
  };

  const completeRegistration = () => {
    setRegistrationComplete(true);
    setStatus(`Registration completed successfully! ${userName}'s face ID is now set up with 200 photos.`);
  };

  const resetRegistration = () => {
    setCapturedPhotos([]);
    setRegistrationComplete(false);
    setIsHoldingButton(false);
    setIsCapturing(false);
    setUserName('');
    setShowNameInput(true);
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    setStatus('Registration reset. Please enter your name to begin again.');
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

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="face-id-container">
      <h2 className="component-title">Face ID Registration</h2>
      
      {/* Name Input Section */}
      {showNameInput && (
        <div className="name-input-section">
          <form onSubmit={handleNameSubmit} className="name-form">
            <div className="input-group">
              <label htmlFor="userName" className="input-label">Enter your name:</label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your full name"
                className="name-input"
                required
                disabled={loading}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || !userName.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Loading...
                </>
              ) : (
                'Continue to Camera'
              )}
            </button>
          </form>
        </div>
      )}
      
      {/* Camera Section - Only show after name is entered */}
      {!showNameInput && (
        <>
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
          
          {/* Hold to Capture Button - Moved above images */}
          {cameraStarted && !registrationComplete && (
            <div className="button-group">
              <button 
                onMouseDown={startCapturing}
                onMouseUp={stopCapturing}
                onMouseLeave={stopCapturing}
                onTouchStart={startCapturing}
                onTouchEnd={stopCapturing}
                disabled={capturedPhotos.length >= REQUIRED_PHOTOS} 
                className={`btn btn-secondary ${isHoldingButton ? 'btn-holding' : ''}`}
              >
                {isHoldingButton ? (
                  <>
                    <span className="spinner"></span>
                    Capturing... ({capturedPhotos.length}/{REQUIRED_PHOTOS})
                  </>
                ) : (
                  `Hold to Capture (${capturedPhotos.length}/${REQUIRED_PHOTOS})`
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
            </div>
          )}
          
          {/* Photo Grid - Show only first 20 photos for performance */}
          {capturedPhotos.length > 0 && (
            <div className="photo-grid">
              {Array.from({ length: Math.min(20, REQUIRED_PHOTOS) }, (_, index) => (
                <div 
                  key={index} 
                  className={`photo-item ${index < capturedPhotos.length ? 'captured' : ''}`}
                >
                  {index < capturedPhotos.length && (
                    <img src={capturedPhotos[index]} alt={`Photo ${index + 1}`} />
                  )}
                </div>
              ))}
              {capturedPhotos.length > 20 && (
                <div className="photo-item captured">
                  <div className="more-photos-indicator">
                    +{capturedPhotos.length - 20} more
                  </div>
                </div>
              )}
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
            
            {registrationComplete && (
              <button 
                onClick={resetRegistration} 
                className="btn btn-primary"
              >
                Register Another Face
              </button>
            )}
          </div>
        </>
      )}
      
      <div className={`status-message ${getStatusClass()}`}>
        {status}
      </div>
      
      {capturedPhotos.length > 0 && capturedPhotos.length < REQUIRED_PHOTOS && (
        <div className="status-message status-info">
          <strong>Tip:</strong> Hold the button and move your head to different angles (left, right, up, down) to capture a variety of poses for better recognition. Capturing 200 photos will take about 20 seconds.
        </div>
      )}
    </div>
  );
} 