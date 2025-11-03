#!/usr/bin/env python3
"""
Helper script to load profiles from output.json into the face recognition service
Run this after starting app.py and uploading profiles to Convex
"""

import requests
import json
import sys

def load_profiles_from_file(json_file_path):
    """Load profiles from output.json and send to face recognition service"""
    
    # Read JSON file
    try:
        with open(json_file_path, 'r') as f:
            profiles = json.load(f)
        print(f"✓ Loaded {len(profiles)} profiles from {json_file_path}")
    except Exception as e:
        print(f"✗ Failed to read file: {e}")
        return False
    
    # Send to service
    try:
        response = requests.post(
            'http://localhost:5001/load-profiles',
            json={'profiles': profiles},
            timeout=300  # 5 minutes for processing
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✓ Profile loading complete!")
            print(f"  Computed: {result['computed']}")
            print(f"  Failed: {result['failed']}")
            print(f"  Total: {result['total']}")
            return True
        else:
            print(f"✗ Request failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"✗ Failed to send request: {e}")
        print("\nMake sure the Flask server is running:")
        print("  cd python-service && python app.py")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python load_profiles.py <path_to_output.json>")
        print("\nExample:")
        print("  python load_profiles.py ../../output.json")
        sys.exit(1)
    
    json_file = sys.argv[1]
    
    print("=" * 60)
    print("Dex - Load Profiles for Face Recognition")
    print("=" * 60)
    print(f"File: {json_file}")
    print("=" * 60)
    print("\nThis will:")
    print("1. Read profiles from JSON file")
    print("2. Download profile images")
    print("3. Compute face embeddings")
    print("4. Store in memory for fast matching")
    print("\nThis may take 2-5 minutes...\n")
    
    success = load_profiles_from_file(json_file)
    
    if success:
        print("\n✓ Ready for face recognition!")
        print("  Open http://localhost:3000 and start scanning")
    else:
        print("\n✗ Failed to load profiles")
        sys.exit(1)

