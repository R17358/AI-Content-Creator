import React, { useState } from 'react'
import './Home.css'
import axios from '../../api/axios';
import { useEffect } from 'react';

import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import PromptDownloader from '../../components/PromptDownloader/PromptDownloader';


function Home() {

  const [prompt, setPrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [file, setFile] = useState(null);
  const [videoLength, setVideoLength] = useState(10);
  const [mipr_list, setMIPRList] = useState([]);
  const [image_duration, setImage_duration] = useState([]);
  const [transition_list, setTransitionList] = useState([]);
  const [images, setImages] = useState([]);
  const [musicFilePath, setMusicFilePath] = useState('');
  const [imagePath, setImagePaths] = useState([]);
  const [videoUrl, setVideoUrl] = React.useState(null);
  const [orientation, setOrientation] = useState('landscape');
  const [copy, setCopy] = useState(false);
  const [getidea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getIdea();
  }, []);

  useEffect(() => {
  
    if (enhancedPrompt.trim() !== "") {
      (async () => {
        await writeLyrics(enhancedPrompt); // Uses latest enhancedPrompt
      })();
    }
  }, [enhancedPrompt]); // This will trigger when enhancedPrompt is updated

  useEffect(() => {
    if (lyrics.trim() !== "") {
      (async () => {
        await videoLenHandler(); // Uses latest lyrics
      })();
    }
  }, [lyrics]); // This will trigger when lyrics is updated

  const getIdea = async () => {
    try {
      const idea_res = await axios.get('/idea');
      console.log("idea: ", idea_res); // Debugging
      setIdea(idea_res.data.idea);
    }
    catch (error) {
      console.log(error);
    }
  }

  const createVideo = async () => {
    toast.success("Creating video...");
    toast.success("Please wait for a minute...");
    try {
      const video_response = await axios.post('/make-video', {
        "genImagesPaths": imagePath,
        "musicFilePath": musicFilePath,
        "imageDuration": image_duration,
        "transition_list": transition_list,
        "video_length": videoLength
      }, {
        responseType: 'blob'  // IMPORTANT: Treat response as binary data
      })

      console.log(video_response);
      console.log("Blob Type:", video_response.data.type); // Should print "video/mp4"


      // Create a URL for the video blob


      const videoBlob = new Blob([video_response.data], { type: "video/mp4" });
      const videoUrl = URL.createObjectURL(videoBlob);

      // Update state with the video URL
      setVideoUrl(videoUrl);

      toast.success("Video created successfully!");

    }
    catch (error) {
      console.log(error);
      toast.error("Failed to create video!");
    }
  }

  
  const copyToClipboard = (text) => {
    setCopy(true);

    navigator.clipboard.writeText(text)
      .then(()=>{setTimeout(() => setCopy(false), 1000);})
      .catch(() => alert("Failed to copy"));
  };


  const handleOrientationChange = (event) => {
    setOrientation(event.target.value);
  };

  const handleImageFileChange = (e) => {
    // const selectedFiles = Array.from(e.target.files); // Convert FileList to an array
    // setImages(selectedFiles);
    const selectedFiles = Array.from(e.target.files); // Convert FileList to array
  setImages((prevImages) => [...prevImages, ...selectedFiles]); // Append new files
  };


  const handleImageUpload = async () => {
    if (images.length === 0) {
      alert("Please select images first!");
      return;
    }
  
    const formData = new FormData();
    
    images.forEach((image, index) => {
      //formData.append(`images_${index}`, image); // Append with explicit key for order
      formData.append("images", image); 
    });
  
    console.log("Uploading images:", images);
  
    try {
      const response = await axios.post("/send-images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      const paths = response.data.files.map(file => file.path);
      setImagePaths(paths);
      console.log("Upload successful:", response.data);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload images!");
    }
  };
  


  const handleSubmit = async () => {
    try {
      const res = await axios.post('/send-prompt', { prompt });
      setEnhancedPrompt(res.data.enhanced_prompt);
      console.log(res); // Now this will print the response data
      toast.success("Prompt submitted successfully!");

    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to submit prompt!");
    }
  };

  const writeLyrics = async (enhancedPrompt) => {
    try {
      const lyrics_res = await axios.post('/get-lyrics', { "enhanced_prompt": enhancedPrompt });
     // console.log("New Lyrics Received:", lyrics_res.data.lyrics); // Debugging
      setLyrics(lyrics_res.data.lyrics);
      //console.log(lyrics);
    }
    catch (error) {
      console.log(error);
    }
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMusicFilePath(response.data.file_path);
      console.log('Upload success:', response.data);
      toast.success(`File uploaded to folder: ${response.data.folder}`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error("File upload failed!");
    }
  };

  const videoLenHandler = async () => {
    try {
      const response = await axios.post('/get-video-length', { "videoLength": videoLength, "lyrics": lyrics });
      // const parsedImagePrompts = JSON.parse(response.data.image_prompts);

      const mipr_list = response.data.mipr_list;
      const image_duration = response.data.image_duration;
      const transition_list = response.data.transition_list;
      console.log(response);

      setMIPRList(mipr_list);
      setImage_duration(image_duration);
      setTransitionList(transition_list);
     // console.log("MIPR List:", mipr_list);
      toast.success("Video length set successfully!");

    }
    catch (error) {
      console.log(error);
      toast.error("Failed to set video length!");
    }
  }

  return (
    <div className="home">

      {
        getidea ? <div className="idea">
          <h2>Get Idea !</h2>
          <textarea spellCheck={false} value={getidea}>{getidea}</textarea>
          {
              copy?<i className='bx bx-copy-alt' style={{color:'#0ce1d7'}}  ></i>:
              <i className='bx bxs-copy' style={{color:'#0ce1d7'}} onClick={() => copyToClipboard(getidea)}></i>
          }
        </div> : <br />
      }

      <div className="main-container-prompt-music">
        <div className="prompt-input">
          <label htmlFor="prompt">Enter Prompt: </label>
          <div className="input-prompt">
            <input type="text" name="prompt" id="prompt" spellCheck={false} placeholder='Lyrics for song on ....' onChange={(e) => { setPrompt(e.target.value) }} 
            onKeyDown={(e) => {
            if (e.key === "Enter" && prompt.trim() !== "") {
              handleSubmit();
            }
          }}/>
            <i className='bx bxs-send' style={{ color: "#0fcfe4", fontSize: "36px" }} onClick={handleSubmit} >

      </i>


          </div>
        </div>

        <div className="music-file-uploader">
          <div className="file-uploader">
            <input type="file" name="music" id="music" onChange={handleFileChange} />
          </div>
          <div className="file-upload">
            <button type='button' onClick={handleUpload}>Upload Song</button>
          </div>
        </div>
      </div>


      <div className="video-length-aspect">

        <div className="orientation-set">

          <label>
            <input
              type="radio"
              name="orientation"
              value="landscape"
              checked={orientation === "landscape"}
              onChange={handleOrientationChange}
            />
            Landscape
          </label>
          <label>
            <input
              type="radio"
              name="orientation"
              value="portrait"
              checked={orientation === "portrait"}
              onChange={handleOrientationChange}
            />
            Portrait
          </label>
        </div>

      </div>

      
          
      {
        enhancedPrompt ? <div className="enhanced-prompt">
          <h2>Enhanced Prompt</h2>
          <p>{enhancedPrompt}</p>
        </div> : <br />
      }

      {
        lyrics ? <div className="lyrics">
          <h2>Lyrics</h2>
          {
              copy?<i className='bx bx-copy-alt' style={{color:'#0ce1d7'}}  ></i>:
              <i className='bx bxs-copy' style={{color:'#0ce1d7'}} onClick={() => copyToClipboard(lyrics)}></i>
          }
          < textarea value={lyrics} spellCheck={false} onChange={(e)=>{setLyrics(e.target.value)}}></textarea>
        </div> : <br />
      }
  
      <div className="video-length">
          <label htmlFor="video-length">Enter Length of Video in seconds (60s): </label>
          <div className="video-length-input">
            <input type="number" name="video-length" id="video-length"  min={5} onChange={(e) => { setVideoLength(Number(e.target.value)) }} />
            <button type="button" onClick={videoLenHandler}>SET</button>
          </div>
        </div>



      {
        mipr_list ? (
          <PromptDownloader mipr_list={mipr_list} orientation={orientation} />
        ) : <br />
      }
      <hr/>

      <div className="imageUploads">
        <input
          type="file"
          name="images"
          id="images"
          multiple
          onChange={handleImageFileChange}
        />
        <button type="button" onClick={handleImageUpload}>Upload Images</button>

        {images.length > 0 && (
          <div className="preview">
            <h3>Selected Images:</h3>
            <ul>
              {images.map((image, index) => (
                <li key={index}>{image.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      

      <div className="create-video">
        <button type="button" onClick={createVideo}>Generate video</button>
      </div>

      <div className="video-part">
        <h2>Generated Video </h2>
        <div className="video-display">
          {videoUrl && (
            <video key={videoUrl} controls >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        <div className="video-options">

          {videoUrl && (
            <a href={videoUrl} download="generated_video.mp4">
              <button>Download Video</button>
            </a>
          )}

          {videoUrl && (
            <button onClick={() => window.open(videoUrl, "_blank")}>
              Open Video in New Tab
            </button>
          )}
        </div>
      </div>


    </div>
  )
}

export default Home