import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, Loader2, AlertTriangle, CheckCircle, Video } from 'lucide-react';
import { backendSim } from '../mockData';

export default function AIAnalysis({ onTriggerEmergency }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [stream, setStream] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageCaptured, setImageCaptured] = useState(null);

  useEffect(() => {
    return () => {
      // Cleanup stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const requestCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: true // Requesting both as requested
      });
      setStream(mediaStream);
      setHasPermission(true);
      // Wait for ref to attach
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error(err);
      alert('Camera/Microphone permission denied or unavailable on this device.');
    }
  };

  const captureAndAnalyze = async () => {
    let capturedDataUrl = null;
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      capturedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setImageCaptured(capturedDataUrl);
    }

    setAnalyzing(true);
    setResult(null);
    try {
      const res = await backendSim.analyzeImage(capturedDataUrl);
      setResult(res);
    } catch (e) {
      console.error(e);
      setResult({ isEmergency: false, detected: 'Error Analyzing', advice: 'Could not reach AI', service: 'none', confidence: 0 });
    } finally {
      setAnalyzing(false);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setHasPermission(false);
      }
    }
  };

  const handleRecapture = () => {
    setResult(null);
    setImageCaptured(null);
    requestCamera();
  };

  return (
    <div className="container animate-fade-in flex-col w-full h-full">
      <h2>AI Situation Analysis</h2>
      <p>Quickly assess an emergency using your camera.</p>

      {!hasPermission && !analyzing && !result && (
        <div className="flex-col items-center justify-center gap-4 mt-6 flex-1">
          <div 
            className="w-full bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer p-8 hover:bg-slate-200 transition-colors"
            onClick={requestCamera}
            style={{ minHeight: '250px' }}
          >
            <Video size={48} className="text-slate-400 mb-4" />
            <span className="font-medium text-center text-slate-600">Start Live Camera</span>
            <span className="text-xs text-center text-slate-400 mt-2">Will request Camera & Mic access</span>
          </div>
          
          <div className="text-xs text-center text-slate-400 mt-4 p-2 bg-slate-100 rounded">
            <strong>Note:</strong> Set your Gemini API key in Profile to use real live AI image scanning instead of simulated data!
          </div>
        </div>
      )}

      {hasPermission && !analyzing && !result && (
        <div className="flex-col items-center justify-center gap-4 mt-4 flex-1">
          <div className="w-full bg-black rounded-lg overflow-hidden relative shadow-md" style={{ minHeight: '300px' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover absolute inset-0"
              style={{ width: '100%', height: '100%' }}
            ></video>
          </div>
          <button 
            className="btn btn-primary btn-universal mt-4 w-full"
            onClick={captureAndAnalyze}
            style={{ padding: '1rem', borderRadius: '1rem' }}
          >
            <Camera size={20} /> Capture & Analyze
          </button>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {analyzing && (
        <div className="flex-col items-center justify-center gap-4 mt-10 flex-1 py-10 text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mb-4 mx-auto" style={{ color: 'var(--color-police)' }} />
          <h3 className="font-semibold">Analyzing Scene...</h3>
          <p className="text-sm text-center max-w-xs">AI is detailing the scene using Multi-modal inference.</p>
        </div>
      )}

      {result && !analyzing && (
        <div className="animate-slide-up mt-4 mb-8">
          <div className="map-container mb-4 flex items-center justify-center bg-slate-800 rounded-lg overflow-hidden relative">
            {imageCaptured ? (
              <img src={imageCaptured} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div className="text-white text-opacity-50 text-sm">Image Data Unavailable</div>
            )}
            <div className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded font-bold ${result.isEmergency ? 'bg-red-500' : 'bg-green-500'}`}>
               {result.confidence}% Confident
            </div>
          </div>
          
          <div className="rounded-lg p-4 mb-6" style={{ background: result.isEmergency ? 'var(--color-ambulance-bg)' : 'var(--color-success-bg)', borderColor: result.isEmergency ? 'var(--color-ambulance)' : 'var(--color-success)', borderStyle: 'solid', borderWidth: '1px' }}>
            <div className="flex items-start gap-3">
              {result.isEmergency ? <AlertTriangle size={24} color="var(--color-ambulance)" /> : <CheckCircle size={24} color="var(--color-success)" />}
              <div>
                <h3 className="font-bold" style={{ color: result.isEmergency ? 'var(--color-ambulance)' : 'var(--color-success)', marginBottom: '0.25rem' }}>
                  {result.isEmergency ? `Emergency: ${result.detected}` : `Status: Appears Safe`}
                </h3>
                <p className="text-sm m-0" style={{ color: 'var(--text-secondary)' }}>
                  {result.isEmergency ? `System confirms visual signs of an emergency. ${result.advice}` : `AI detected: ${result.detected}. ${result.advice}`}
                </p>
              </div>
            </div>
          </div>

          {result.isEmergency && (
            <button 
              className="btn btn-danger btn-universal w-full mb-3 shadow-universal"
              onClick={() => onTriggerEmergency(result.service)}
              style={{ padding: '1rem' }}
            >
              {result.advice} Now
            </button>
          )}
          
          <button 
            className="btn btn-secondary w-full border"
            onClick={handleRecapture}
          >
            {result.isEmergency ? "Recapture Stream" : "Scan Again"}
          </button>
        </div>
      )}
    </div>
  );
}
