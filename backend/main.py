from promptEnhancer import promptEnhacerResponse as pe
from LyricsWriter import lyricsResponse
from imageGenPrompter import imgPrompt
from imageGen import ImageGenerator
from TextGeneration import chatResponse
from createVideo import create_video, add_music_to_video
from modifiedImgPrompt import modifiedImgPromptResponse as mipr
import time
import json
from fixVideo import fixVideoToShow as fix
import os
from musicFileLen import get_audio_length
from flask import Flask, request, jsonify, send_from_directory, send_file, Response
from flask_cors import CORS
import os
import tempfile
import uuid

# https://ai-content-creator-xi.vercel.app

app = Flask(__name__)
CORS(app, origins="http://localhost:5173", supports_credentials=True) # Enable CORS


@app.route('/api/idea', methods=['GET'])
def get_idea():
    idea = chatResponse("Suggest an idea for generating song lyrics in Hindi. Choose any type of song, such as romantic, sad, happy, inspirational, or devotional. Provide a creative and unique theme for the lyrics, along with a brief description of its mood and setting. Do not generate the lyrics—only provide the idea and concept for the song. also summarize in hindi")
    return jsonify({"idea": idea})

@app.route('/api/send-prompt', methods=['POST'])
def receive_message():
    data = request.get_json()  # Get JSON data from React
    prompt = data.get('prompt', '')
    
    print(f"Received prompt: {prompt}")  # Log the message

    enhanced_prompt = pe(prompt)
    
    return jsonify({"status": "success", "enhanced_prompt": enhanced_prompt})

@app.route('/api/get-lyrics', methods=['POST'])
def write_lyrics():
    enhanced_prompt = request.get_json().get('enhanced_prompt', '')

    lyrics = lyricsResponse(enhanced_prompt)

    return jsonify({"status": "success", "lyrics": lyrics})


UPLOADS_DIR = os.path.join(tempfile.gettempdir(), "uploaded_files")  # Base folder for uploads
os.makedirs(UPLOADS_DIR, exist_ok=True)  # Ensure the base directory exists

IMAGE_FOLDER = os.path.join(UPLOADS_DIR, "images")
os.makedirs(IMAGE_FOLDER, exist_ok=True)

def save_uploaded_file(uploaded_file):
    
    unique_folder = f"uploaded_music_file"  # Custom named unique folder
    folder_path = os.path.join(UPLOADS_DIR, unique_folder)
    os.makedirs(folder_path, exist_ok=True)  # Ensure folder exists

    file_path = os.path.join(folder_path, uploaded_file.filename)

    # Save the file
    with open(file_path, 'wb') as f:
        f.write(uploaded_file.read())
    
    musicLength = get_audio_length(file_path)

    return folder_path, file_path, musicLength  # Return folder & file path for further processing


    
    # return file_path, musicLength, numOfPrompts

@app.route('/api/upload', methods=['POST'])
def upload_file():
    
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    uploaded_file = request.files['file']  # Get file from request

    if uploaded_file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    # Save the uploaded file in a uniquely named folder
    folder_path, file_path, musicLength = save_uploaded_file(uploaded_file)

    return jsonify({
        "message": "File uploaded successfully",
        "folder": folder_path,
        "file_path": file_path,
        "file_url": f"/download/{os.path.basename(folder_path)}/{uploaded_file.filename}",
        "musicLength": musicLength
    }), 200

@app.route('/api/download/<folder>/<filename>', methods=['GET'])
def download_file(folder, filename):    
    folder_path = os.path.join(UPLOADS_DIR, folder)
    return send_from_directory(folder_path, filename, as_attachment=True)

@app.route('/api/get-video-length', methods=['POST'])
def getVideoLength():
    try:
        videoLength = request.get_json().get('videoLength', '')
        lyrics = request.get_json().get('lyrics', '')
        numOfPrompts = int(int(videoLength) // 4)
        imagePrompts = imgPrompt(lyrics, numOfPrompts)
        mipr_list, imageDuration, transition_list =  furtherImg(imagePrompts)
        return jsonify({"status": "success", "mipr_list": mipr_list, "image_duration": imageDuration, "transition_list": transition_list})
    except Exception as e:
        print(e)
        return jsonify({"error": e}), 500


def furtherImg(imagePrompts): 
    # print(imagePrompts)
    mipr_list = []
    imageDuration = []
    transition_list = []
    # st.text(imagePrompts)
    if isinstance(imagePrompts, str):  
        imagePrompts = json.loads(imagePrompts)

    for p in imagePrompts:
        img_prompts = []
        if len(p) > 5:
            img_prompts.extend([p[0], p[3], p[5]])
            imageDuration.append(p[1])
            transition_list.append(p[2])
        try:
            modified_image_prompt = mipr(img_prompts)
            mipr_list.append(modified_image_prompt)
            # st.text(modified_image_prompt)
        except Exception as e:
            print(e)

    return mipr_list, imageDuration, transition_list

# @app.route('/api/send-images', methods=['POST'])
# def upload_image_file():
#     if 'images' not in request.files:
#         return jsonify({"error": "No file part"}), 400

#     files = request.files.getlist('images')  # Get multiple files
#     genImagesPaths = []

#     for file in files:
#         if file.filename == '':
#             continue

#         temp_file_path = os.path.join(IMAGE_FOLDER, file.filename)
#         file.save(temp_file_path)  # Save file inside images folder
#         genImagesPaths.append({"filename": file.filename, "path": temp_file_path})

#     return jsonify({"message": "Images uploaded successfully!", "files": genImagesPaths})

@app.route('/api/send-images', methods=['POST'])
def upload_image_file():
    files = sorted(request.files.items(), key=lambda x: x[0])  # Sort by field name (to maintain order)
    
    genImagesPaths = []
    
    for key, file in files:
        if file.filename == '':
            continue

        temp_file_path = os.path.join(IMAGE_FOLDER, file.filename)
        file.save(temp_file_path)  # Save file inside images folder
        genImagesPaths.append({"filename": file.filename, "path": temp_file_path})

    return jsonify({"message": "Images uploaded successfully!", "files": genImagesPaths})


GENERATED_VIDEO_DIR = "Generated_video"
if not os.path.exists(GENERATED_VIDEO_DIR):
    os.makedirs(GENERATED_VIDEO_DIR)

@app.route('/api/make-video', methods=['POST'])
def make_video():
    print("called make video")
    data = request.get_json()
    gen_images_paths = data.get('genImagesPaths', [])
    music_file_path = data.get('musicFilePath', '')
    image_duration = data.get('imageDuration', [])
    transition_list = data.get('transition_list', [])
    video_length = data.get('video_length', '')

    # Create a temporary directory
    temp_dir = tempfile.mkdtemp()
    output_video_path = os.path.join(temp_dir, "output_video.mp4")
    print("creating video")
    # Create video
    video_path = create_video(gen_images_paths, output_video_path, image_duration, transition_list, video_length, 30, 1.5)

    if not video_path or not os.path.exists(video_path):
        return jsonify({"error": "Video creation failed"}), 500

    time.sleep(1)
    final_video_path = video_path

    # Add music if provided
    if music_file_path:
        print("adding music")
        output_video_music_path = os.path.join(temp_dir, "output_video_music.mp4")
        music_video_path = add_music_to_video(video_path, music_file_path, output_video_music_path)

        if not music_video_path or not os.path.exists(music_video_path):
            return jsonify({"error": "Music addition failed"}), 500

        final_video_path = music_video_path

    # Ensure the Generated_video directory exists
    if not os.path.exists(GENERATED_VIDEO_DIR):
        os.makedirs(GENERATED_VIDEO_DIR)
    print("fixing video")
    # Check if the final video exists before sending
    if os.path.exists(final_video_path):
        output_video = os.path.abspath(os.path.join(GENERATED_VIDEO_DIR, f"output_fixed{int(time.time())}.mp4"))
        video = fix(final_video_path, output_video)

        if video is None:
            return jsonify({"error": "Video processing failed"}), 500
        print("video processed")
        return Response(video, mimetype="video/mp4", headers={
            "Content-Disposition": "inline; filename=output_fixed.mp4",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        })

    return jsonify({"error": "Video not found"}), 404



if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0", port=8080)




