'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface LiveCameraProps {
  onCapture: (imageData: string) => void;
  isScanning: boolean;
}

export default function LiveCamera({ onCapture, isScanning }: LiveCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Auto-capture every 3 seconds when scanning enabled
  useEffect(() => {
    if (isCameraReady && !isScanning) {
      // Clear interval when not scanning
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else if (isCameraReady && isScanning) {
      // Start auto-capture
      intervalRef.current = setInterval(() => {
        captureFrame();
      }, 3000); // Every 3 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCameraReady, isScanning]);

  const startCamera = async () => {
    try {
      setError('');
      setIsCameraReady(false);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else {
          setError('Failed to access camera: ' + err.message);
        }
      } else {
        setError('Failed to access camera.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraReady(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      onCapture(imageData);
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden border border-zinc-800">
      {error ? (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <CameraOff className="w-16 h-16 text-red-500 mb-4" />
          <p className="text-red-400 text-center mb-4">{error}</p>
          <button
            onClick={startCamera}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
          >
            Retry Camera Access
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {!isCameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
              <Camera className="w-16 h-16 text-white mb-4 animate-pulse" />
              <p className="text-white">Starting camera...</p>
            </div>
          )}

          {/* Scanning Overlay */}
          {isScanning && isCameraReady && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Scanning line animation */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-scan" />
              
              {/* Corner brackets */}
              <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-white" />
              <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-white" />
              
              {/* Status text */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 px-4 py-2 rounded-full">
                <p className="text-white text-sm font-medium">Scanning...</p>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </>
      )}

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

