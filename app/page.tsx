'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import LiveCamera from '@/components/LiveCamera';
import ProfileCard from '@/components/ProfileCard';
import { Camera, Users, Upload, Activity, AlertCircle, CheckCircle, Search } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type StatusType = 'idle' | 'scanning' | 'analyzing' | 'matched' | 'no-match' | 'error';

export default function Dashboard() {
  const [isScanning, setIsScanning] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [matchConfidence, setMatchConfidence] = useState<number | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusType>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('Ready to scan');
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<Array<{ timestamp: string; type: string; message: string }>>([]);

  const attendeeCount = useQuery(api.attendees.getAttendeeCount);
  const allAttendees = useQuery(api.attendees.getAllAttendees);

  const addLog = (type: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    setTerminalLogs(prev => [...prev.slice(-50), { timestamp, type, message }]);
  };

  const handleCapture = async (imageData: string) => {
    if (!isScanning || isMatching) return;

    setIsMatching(true);
    setStatus('analyzing');
    setStatusMessage('Analyzing face pattern...');
    setError(null);
    addLog('info', 'Capturing frame for analysis...');

    try {
      console.log('Capturing frame for face recognition...');
      addLog('info', 'Sending request to recognition service...');
      
      // Call Python face recognition API
      const response = await fetch('http://localhost:5001/match-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Face recognition API error:', response.status, errorText);
        addLog('error', `API error ${response.status}: ${errorText.substring(0, 100)}`);
        
        // Stop scanning on error
        setIsScanning(false);
        setStatus('error');
        
        if (response.status === 400 && errorText.includes('No profiles loaded')) {
          setStatusMessage('No profiles loaded in system');
          setError('Run profile loader: python load_profiles.py ../../output_merged.json');
          addLog('error', 'No profiles loaded. Run: python load_profiles.py ../../output_merged.json');
        } else {
          setStatusMessage('Recognition service error');
          setError(`Service returned error ${response.status}. Check Flask server.`);
          addLog('error', 'Flask service error - check server logs');
        }
        return;
      }

      const result = await response.json();
      console.log('Face recognition result:', result);
      addLog('success', `Analysis complete in ${result.match_time?.toFixed(2)}s`);

      // Store top 3 candidates
      if (result.top_3_candidates) {
        setTopCandidates(result.top_3_candidates);
        addLog('info', `Top candidates: ${result.top_3_candidates.map((c: any) => c.name).join(', ')}`);
        console.log('Top 3 candidates:');
        result.top_3_candidates.forEach((candidate: any, i: number) => {
          console.log(`  ${i + 1}. ${candidate.name} - ${(candidate.confidence * 100).toFixed(1)}%`);
        });
      }

      if (result.matched_profile) {
        // Find full profile from Convex
        const profile = allAttendees?.find(
          (a) => a.publicIdentifier === result.matched_profile.publicIdentifier
        );

        if (profile) {
          setMatchedProfile(profile);
          setMatchConfidence(result.confidence);
          setStatus('matched');
          setStatusMessage(`Match found: ${profile.fullName}`);
          addLog('success', `MATCH: ${profile.fullName} (${(result.confidence * 100).toFixed(1)}% confidence)`);
          console.log('Matched:', profile.fullName, 'Confidence:', (result.confidence * 100).toFixed(1) + '%');
        } else {
          console.warn('Profile found in API but not in Convex:', result.matched_profile.publicIdentifier);
          setStatus('error');
          setStatusMessage('Database sync error');
          setError('Profile found but not loaded in database');
          addLog('error', 'Database sync error - profile not in Convex');
        }
      } else {
        console.log('No match found');
        setMatchConfidence(null);
        setStatus('no-match');
        setStatusMessage('No confident match detected');
        setError(null);
        addLog('warning', 'No confident match found');
      }
    } catch (err: any) {
      console.error('Face matching error:', err);
      addLog('error', `Critical error: ${err.message}`);
      
      // Stop scanning on critical error
      setIsScanning(false);
      setStatus('error');
      
      // More specific error messages
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        setStatusMessage('Service unavailable');
        setError('Python Flask server not running on port 5001');
        addLog('error', 'Cannot connect to Flask server on port 5001');
      } else if (err.message.includes('No profiles loaded')) {
        setStatusMessage('No profiles loaded');
        setError('Run profile loader script first');
        addLog('error', 'Profile database empty - run loader');
      } else {
        setStatusMessage('Recognition failed');
        setError(err.message || 'Unknown error occurred');
        addLog('error', err.message || 'Unknown error');
      }
    } finally {
      setIsMatching(false);
    }
  };

  const toggleScanning = () => {
    const newState = !isScanning;
    setIsScanning(newState);
    
    if (newState) {
      setStatus('scanning');
      setStatusMessage('Scanning for faces...');
      setError(null);
      addLog('info', 'Started scanning');
    } else {
      setStatus('idle');
      setStatusMessage('Ready to scan');
      setError(null);
      addLog('info', 'Stopped scanning');
    }
  };
  
  // Update status when scanning starts
  useEffect(() => {
    if (isScanning && !isMatching) {
      setStatus('scanning');
      setStatusMessage('Scanning for faces...');
    }
  }, [isScanning, isMatching]);

  // Initial log on mount
  useEffect(() => {
    addLog('info', 'Dex Recognition System initialized');
    addLog('info', `Loaded ${attendeeCount || 0} profiles from database`);
  }, []);

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'matched': return 'text-green-400';
      case 'analyzing': return 'text-blue-400';
      case 'scanning': return 'text-gray-400';
      case 'error': return 'text-red-400';
      case 'no-match': return 'text-yellow-400';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'matched': return <CheckCircle className="w-5 h-5" />;
      case 'analyzing': return <Search className="w-5 h-5 animate-pulse" />;
      case 'scanning': return <Activity className="w-5 h-5 animate-pulse" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'no-match': return <AlertCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Modern Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-zinc-800/50 px-6 py-3 backdrop-blur-xl bg-black/80"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-400 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-sm">D</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Dex</h1>
            <span className="text-xs text-gray-500 bg-zinc-900 px-2 py-0.5 rounded-full">BETA</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-400 bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">
                {attendeeCount !== undefined ? attendeeCount : '...'} profiles
              </span>
            </div>
            
            <Link href="/upload">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 px-3 py-1.5 bg-white text-black hover:bg-gray-100 rounded-lg transition-all cursor-pointer text-xs font-medium"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-4 p-4">
        {/* Left: Camera + Controls */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-96 flex flex-col gap-4"
        >
          {/* Camera Card */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                <h2 className="text-sm font-semibold text-gray-200">Live Feed</h2>
              </div>
              <motion.button
                onClick={toggleScanning}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-1.5 rounded-lg font-medium text-xs transition-all shadow-lg ${
                  isScanning
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {isScanning ? 'Stop Scan' : 'Start Scan'}
              </motion.button>
            </div>

            {/* Square Camera */}
            <div className="w-full aspect-square bg-black rounded-lg overflow-hidden border border-zinc-800 shadow-2xl">
              <LiveCamera onCapture={handleCapture} isScanning={isScanning} onError={(e) => {}} />
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 backdrop-blur-sm">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">System Status</h3>
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center space-x-3 mb-3"
              >
                <div className={getStatusColor()}>
                  {getStatusIcon()}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${getStatusColor()}`}>{statusMessage}</div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Confidence */}
            {matchConfidence !== null && matchedProfile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <div className="text-xs text-gray-500 mb-1.5">Confidence</div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${matchConfidence * 100}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs font-bold text-green-400">
                    {(matchConfidence * 100).toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-2.5">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-300 leading-relaxed">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Terminal Logs */}
          <div className="flex-1 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3 backdrop-blur-sm overflow-hidden flex flex-col min-h-0">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Activity Log</h3>
            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
              {terminalLogs.length === 0 ? (
                <div className="text-xs text-gray-600">Waiting for activity...</div>
              ) : (
                terminalLogs.map((log, i) => (
                  <div key={i} className="flex space-x-2 text-xs">
                    <span className="text-gray-600 flex-shrink-0 font-mono">{log.timestamp}</span>
                    <span className={`flex-shrink-0 font-semibold ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      log.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-gray-300 flex-1">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Right: Profile Display - Fills remaining space */}
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 bg-black overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {matchedProfile ? (
              <motion.div
                key={matchedProfile.publicIdentifier}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ProfileCard profile={matchedProfile} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-gray-600 p-8"
              >
                <div className="relative">
                  <Users className="w-20 h-20 mb-4 opacity-10" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-500 mb-2">
                  No Profile Detected
                </h2>
                <p className="text-center max-w-sm text-gray-500 text-sm">
                  {attendeeCount === 0 ? (
                    <>
                      Upload attendee data first. Go to{' '}
                      <Link href="/upload" className="text-white underline hover:text-gray-300">
                        Upload Page
                      </Link>
                    </>
                  ) : isScanning ? (
                    'Point camera at an attendee to see their profile'
                  ) : (
                    'Start scanning to identify attendees'
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
