from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import base64
import io
import time
from PIL import Image
import numpy as np
import os
import json
import tempfile

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Configuration
MODEL_NAME = "Facenet512"  # Fast and accurate
DISTANCE_METRIC = "cosine"
DETECTOR_BACKEND = "retinaface"  # More accurate than opencv (slower but better)

# Store profile embeddings in memory
profile_embeddings = {}
profiles_data = []

def base64_to_image(base64_string):
    """Convert base64 string to PIL Image"""
    # Remove data URL prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))
    return image

def compute_embedding(image_path, enforce_detection=True, detector=None):
    """Compute face embedding for an image"""
    try:
        # Use specified detector or fall back to default
        backend = detector if detector else DETECTOR_BACKEND
        
        embedding_objs = DeepFace.represent(
            img_path=image_path,
            model_name=MODEL_NAME,
            enforce_detection=enforce_detection,  # Reject images without clear faces
            detector_backend=backend,
            align=True
        )
        
        if embedding_objs and len(embedding_objs) > 0:
            return embedding_objs[0]["embedding"]
        return None
    except Exception as e:
        print(f"Error computing embedding: {e}")
        return None

def cosine_distance(embedding1, embedding2):
    """Calculate cosine distance between two embeddings"""
    embedding1 = np.array(embedding1)
    embedding2 = np.array(embedding2)
    
    dot_product = np.dot(embedding1, embedding2)
    norm1 = np.linalg.norm(embedding1)
    norm2 = np.linalg.norm(embedding2)
    
    if norm1 == 0 or norm2 == 0:
        return 1.0
    
    similarity = dot_product / (norm1 * norm2)
    distance = 1 - similarity
    return distance

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': MODEL_NAME,
        'profiles_loaded': len(profiles_data)
    })

@app.route('/load-profiles', methods=['POST'])
def load_profiles():
    """
    Load profiles and pre-compute embeddings
    Expected: { profiles: [...] } - array of profile objects with profilePicHighQuality or profilePic
    """
    try:
        data = request.json
        profiles = data.get('profiles', [])
        
        if not profiles:
            return jsonify({'error': 'No profiles provided'}), 400
        
        global profiles_data, profile_embeddings
        profiles_data = []
        profile_embeddings = {}
        
        computed_count = 0
        failed_count = 0
        
        for profile in profiles:
            # Try multiple image sources
            image_urls = []
            if profile.get('profilePicHighQuality'):
                image_urls.append(profile.get('profilePicHighQuality'))
            if profile.get('profilePic'):
                image_urls.append(profile.get('profilePic'))
            
            # Try profile pic from all dimensions array
            if profile.get('profilePicAllDimensions'):
                for dim in profile.get('profilePicAllDimensions', []):
                    if isinstance(dim, str):
                        image_urls.append(dim)
            
            public_id = profile.get('publicIdentifier')
            
            if not image_urls or not public_id:
                failed_count += 1
                continue
            
            # Download and process image (try each URL)
            try:
                import requests
                image_downloaded = False
                
                for image_url in image_urls:
                    try:
                        response = requests.get(image_url, timeout=10)
                        
                        if response.status_code == 200:
                            image_downloaded = True
                            break
                    except:
                        continue
                
                if image_downloaded:
                    # Save temporarily
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                        tmp_file.write(response.content)
                        tmp_path = tmp_file.name
                    
                    # Compute embedding (use opencv for faster loading, allow missing faces)
                    embedding = compute_embedding(tmp_path, enforce_detection=False, detector='opencv')
                    
                    # Clean up temp file
                    os.unlink(tmp_path)
                    
                    if embedding:
                        profile_embeddings[public_id] = embedding
                        profiles_data.append(profile)
                        computed_count += 1
                        print(f"✓ Computed embedding for: {profile.get('fullName')}")
                    else:
                        failed_count += 1
                        print(f"✗ No face found in: {profile.get('fullName')}")
                else:
                    failed_count += 1
                    print(f"✗ Failed to download image for: {profile.get('fullName')}")
                    
            except Exception as e:
                failed_count += 1
                print(f"✗ Error processing {profile.get('fullName')}: {e}")
        
        return jsonify({
            'success': True,
            'computed': computed_count,
            'failed': failed_count,
            'total': len(profiles)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/match-face', methods=['POST'])
def match_face():
    """
    Match a face from camera capture
    Expected: { imageData: base64_string }
    Returns: { matched_profile, confidence, match_time }
    """
    start_time = time.time()
    
    try:
        data = request.json
        image_data = data.get('imageData')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        if len(profile_embeddings) == 0:
            return jsonify({'error': 'No profiles loaded. Call /load-profiles first'}), 400
        
        # Convert base64 to image
        image = base64_to_image(image_data)
        
        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            image.save(tmp_file.name, 'JPEG')
            tmp_path = tmp_file.name
        
        # Compute embedding for captured image (enforce detection for live camera)
        captured_embedding = compute_embedding(tmp_path, enforce_detection=True)
        
        # Clean up
        os.unlink(tmp_path)
        
        if not captured_embedding:
            return jsonify({
                'matched_profile': None,
                'error': 'No face detected in image'
            })
        
        # Find all matches and sort by distance
        all_matches = []
        
        for public_id, profile_embedding in profile_embeddings.items():
            distance = cosine_distance(captured_embedding, profile_embedding)
            confidence = 1 - distance
            
            all_matches.append({
                'public_id': public_id,
                'distance': distance,
                'confidence': confidence
            })
        
        # Sort by distance (lowest = best match)
        all_matches.sort(key=lambda x: x['distance'])
        
        # Get top 3 matches
        top_3 = all_matches[:3]
        
        # Threshold for Facenet512 (cosine) - Lower = more strict
        # 0.20 = ultra strict (only very confident matches)
        # 0.25 = very strict
        # 0.30 = strict
        # 0.35 = moderately strict
        # 0.40 = balanced
        # 0.50 = lenient (more matches, some false positives)
        CONFIDENCE_THRESHOLD = 0.45  # Lenient: Better for LinkedIn photos
        
        best_match = top_3[0] if top_3 else None
        
        if best_match and best_match['distance'] < CONFIDENCE_THRESHOLD:
            # Find full profile
            matched_profile = next(
                (p for p in profiles_data if p.get('publicIdentifier') == best_match['public_id']),
                None
            )
            
            match_time = time.time() - start_time
            
            # Get top 3 profiles for debugging
            top_3_profiles = []
            for match in top_3:
                profile = next(
                    (p for p in profiles_data if p.get('publicIdentifier') == match['public_id']),
                    None
                )
                if profile:
                    top_3_profiles.append({
                        'name': profile.get('fullName'),
                        'confidence': float(match['confidence']),
                        'distance': float(match['distance'])
                    })
            
            return jsonify({
                'matched_profile': matched_profile,
                'confidence': float(best_match['confidence']),
                'distance': float(best_match['distance']),
                'top_3_candidates': top_3_profiles,  # Show alternatives
                'match_time': float(match_time),
                'success': True
            })
        else:
            # Still show top 3 even if no confident match
            top_3_info = []
            for match in top_3:
                profile = next(
                    (p for p in profiles_data if p.get('publicIdentifier') == match['public_id']),
                    None
                )
                if profile:
                    top_3_info.append({
                        'name': profile.get('fullName'),
                        'confidence': float(match['confidence']),
                        'distance': float(match['distance'])
                    })
            
            return jsonify({
                'matched_profile': None,
                'message': 'No confident match found',
                'top_3_candidates': top_3_info,
                'best_distance': float(best_match['distance']) if best_match else None
            })
        
    except Exception as e:
        print(f"Error in match_face: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("Dex Face Recognition Service")
    print("=" * 60)
    print(f"Model: {MODEL_NAME}")
    print(f"Distance Metric: {DISTANCE_METRIC}")
    print(f"Detector: {DETECTOR_BACKEND}")
    print("=" * 60)
    print("\nEndpoints:")
    print("  GET  /health         - Health check")
    print("  POST /load-profiles  - Load and compute embeddings")
    print("  POST /match-face     - Match face from camera")
    print("=" * 60)
    print("\nStarting server on http://localhost:5001")
    print("Press Ctrl+C to stop\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)

