
import subprocess
import os

# # Input and output video paths
# input_video = "Generated_video/output_video.mp4"
# output_video = "Generated_video/output_fixed.mp4"
# Ensure Generated_video directory exists
GENERATED_VIDEO_DIR = "Generated_video"
if not os.path.exists(GENERATED_VIDEO_DIR):
    os.makedirs(GENERATED_VIDEO_DIR)

def fixVideoToShow(input_video, output_video):
    """Fix video encoding issues using FFmpeg."""
    output_dir = os.path.dirname(output_video)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    if not os.path.exists(input_video):
        print(f"❌ Input video not found: {input_video}")
        return None

    ffmpeg_cmd = [
        "ffmpeg",
        "-i", input_video,
        "-vcodec", "libx264",
        "-acodec", "aac",
        "-strict", "experimental",
        output_video
    ]

    try:
        print("⏳ Processing video, please wait...")
        subprocess.run(ffmpeg_cmd, check=True)
        print(f"✅ Video re-encoded successfully: {output_video}")

        with open(output_video, "rb") as video_file:
            return video_file.read()

    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg Error: {e}")
        return None
