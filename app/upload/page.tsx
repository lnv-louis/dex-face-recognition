'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function UploadPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; inserted: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadAttendees = useMutation(api.attendees.uploadAttendees);
  const attendeeCount = useQuery(api.attendees.getAttendeeCount);
  const clearAll = useMutation(api.attendees.clearAllAttendees);

  const handleUpload = async () => {
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      console.log('📤 Starting upload...');
      
      // Parse JSON input
      const profiles = JSON.parse(jsonInput);
      console.log('✓ JSON parsed successfully');

      // Validate it's an array
      if (!Array.isArray(profiles)) {
        throw new Error('JSON must be an array of profiles');
      }
      console.log(`✓ Found ${profiles.length} profiles`);

      // Validate each profile has required fields
      for (const profile of profiles) {
        if (!profile.publicIdentifier || !profile.fullName) {
          console.error('❌ Invalid profile:', profile);
          throw new Error('Each profile must have publicIdentifier and fullName');
        }
      }
      console.log('✓ All profiles validated');

      // Upload to Convex
      console.log('📡 Uploading to Convex...');
      const uploadResult = await uploadAttendees({ profiles });
      console.log('✅ Upload complete:', uploadResult);
      setResult(uploadResult);
      
      if (uploadResult.inserted > 0) {
        setJsonInput(''); // Clear input on success
      }
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      setError(err.message || 'Failed to upload profiles');
    } finally {
      setUploading(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all attendees?')) return;
    
    try {
      const result = await clearAll();
      alert(`Deleted ${result.deleted} attendees`);
    } catch (err: any) {
      alert('Failed to clear attendees: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Dex - Upload Attendees</h1>
        <p className="text-gray-400 mb-8">
          Paste the Apify output.json below to upload LinkedIn profiles
        </p>

        {/* Stats */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-400">Current Database</div>
          <div className="text-3xl font-bold">
            {attendeeCount !== undefined ? attendeeCount : '...'} attendees
          </div>
          {attendeeCount !== undefined && attendeeCount > 0 && (
            <button
              onClick={handleClearAll}
              className="mt-2 text-sm text-red-500 hover:text-red-400 underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Upload Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Paste Apify JSON Output (Array of Profiles)
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='[{"linkedinUrl": "...", "fullName": "...", "publicIdentifier": "...", ...}, ...]'
              className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white"
              disabled={uploading}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || !jsonInput.trim()}
            className="w-full bg-white text-black py-3 px-6 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Profiles'}
          </button>
        </div>

        {/* Result/Error Display */}
        {result && (
          <div className="mt-6 bg-green-900/20 border border-green-900 rounded-lg p-4">
            <div className="text-green-400 font-medium mb-1">✓ Upload Successful</div>
            <div className="text-sm text-gray-300">
              Inserted: {result.inserted} | Skipped (duplicates): {result.skipped}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-900/20 border border-red-900 rounded-lg p-4">
            <div className="text-red-400 font-medium mb-1">✗ Upload Failed</div>
            <div className="text-sm text-gray-300">{error}</div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
            <li>Copy the contents of output.json (should be an array of profile objects)</li>
            <li>Paste into the textarea above</li>
            <li>Click "Upload Profiles"</li>
            <li>Wait for upload to complete</li>
            <li>Go to the main dashboard to start face recognition</li>
          </ol>
        </div>

        {/* Navigation */}
        <div className="mt-8">
          <a
            href="/"
            className="text-white hover:text-gray-300 underline"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

