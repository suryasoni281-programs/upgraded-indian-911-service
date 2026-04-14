import React, { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, AlertTriangle, CheckCircle, Video } from 'lucide-react';
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
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const requestCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: true 
      });
      setStream(mediaStream);
      setHasPermission(true);
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
      <h2 className="m-0 text-3xl font-bold tracking-tight text-slate-800 mb-2">Scanner</h2>
      <p className="text-slate-500 text-sm mb-6 max-w-sm">Use your optical sensor to securely analyze the situation.</p>

      {!hasPermission && !analyzing && !result && (
        <div className="flex-col items-center justify-center gap-4 mt-6 flex-1">
          <div 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer p-8 hover:bg-slate-100 transition-colors shadow-sm"
            onClick={requestCamera}
            style={{ minHeight: '260px' }}
          >
            <Video size={36} className="text-slate-700 mb-4" />
            <span className="font-semibold text-center text-slate-800">Launch Optical Feed</span>
            <span className="text-xs text-center text-slate-500 mt-2">Requires secure camera/mic access</span>
          </div>
          
          <div className="text-xs text-center text-slate-400 mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <strong>Dev Note:</strong> Attach Gemini API token in Identity to enable actual AI feed inference.
          </div>
        </div>
      )}

      {hasPermission && !analyzing && !result && (
        <div className="flex-col items-center justify-center gap-4 mt-4 flex-1">
          <div className="w-full bg-slate-900 rounded-xl overflow-hidden relative shadow-sm border border-slate-200" style={{ minHeight: '340px' }}>
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
            className="w-full py-4 px-4 bg-slate-900 text-white font-semibold rounded-xl shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mt-4"
            onClick={captureAndAnalyze}
          >
            <Camera size={20} /> Capture Target
          </button>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      {analyzing && (
        <div className="flex-col items-center justify-center gap-4 mt-12 flex-1 py-10 text-center">
          <Loader2 size={42} className="animate-spin text-slate-800 mb-4 mx-auto" />
          <h3 className="font-bold text-slate-800 text-lg">Processing Telemetry...</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">Multimodal inference engine running deep scan.</p>
        </div>
      )}

      {result && !analyzing && (
        <div className="animate-fade-in mt-4 mb-8 flex-col w-full">
          <div className="mb-6 flex items-center justify-center bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200" style={{ minHeight: '220px' }}>
            {imageCaptured ? (
              <img src={imageCaptured} alt="Captured" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div className="text-slate-400 text-sm font-medium">Render Unavailable</div>
            )}
            <div className={`absolute top-3 right-3 text-white text-xs px-3 py-1.5 rounded-full font-bold shadow-sm ${result.isEmergency ? 'bg-red-500' : 'bg-slate-800'}`}>
               {result.confidence}% Match
            </div>
          </div>
          
          <div className={`rounded-xl p-5 mb-6 border ${result.isEmergency ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-start gap-4">
              {result.isEmergency ? <AlertTriangle size={24} className="text-red-500" /> : <CheckCircle size={24} className="text-slate-800" />}
              <div>
                <h3 className={`font-bold text-lg mb-1 ${result.isEmergency ? 'text-red-700' : 'text-slate-800'}`}>
                  {result.isEmergency ? `Alert: ${result.detected}` : `Clear: Nominal Setup`}
                </h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed m-0">
                  {result.isEmergency ? `Visual flags confirmed. ${result.advice}` : `Inference found: ${result.detected}. ${result.advice}`}
                </p>
              </div>
            </div>
          </div>

          {result.isEmergency && (
            <button 
              className="w-full py-4 px-4 bg-red-600 text-white font-bold rounded-xl shadow-sm hover:bg-red-700 transition-colors mb-4 border border-red-700"
              onClick={() => onTriggerEmergency(result.service)}
            >
              {result.advice} (Dispatch Unit)
            </button>
          )}
          
          <button 
            className="w-full py-4 px-4 bg-white text-slate-700 border border-slate-300 font-semibold rounded-xl shadow-sm hover:bg-slate-50 transition-colors flex justify-center"
            onClick={handleRecapture}
          >
            {result.isEmergency ? "Void Sensor Data" : "New Scan"}
          </button>
        </div>
      )}
    </div>
  );
}
