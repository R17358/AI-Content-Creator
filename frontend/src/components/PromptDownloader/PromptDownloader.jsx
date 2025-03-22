import React, { useState } from 'react';
import './PromptDownloader.css'

const PromptDownloader = ({ mipr_list, orientation }) => {




  const [copy, setCopy] = useState(false);

  const downloadPrompts = () => {
    if (!mipr_list || mipr_list.length === 0) {
      alert("No prompts available to download");
      return;
    }
    const instructions = `Instructions for ChatGPT:\n
    - If any description contains content policy violations, handle it appropriately.\n
    - generate all images in ${orientation} mode.\n
    - Generate images one after another without waiting for the user to give the next command.\n\n`;

    const content = instructions + mipr_list.map((prompt, index) => `Prompt ${index + 1}: ${prompt}`).join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "image_prompts.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    setCopy(true);

    navigator.clipboard.writeText(text)
      .then(()=>{setTimeout(() => setCopy(false), 1000);})
      .catch(() => alert("Failed to copy"));
  };

  return (
    <div>
      {mipr_list && mipr_list.length > 0 ? (
         <div className="img-prompt-list">
          <h2>Image Prompts</h2>
         <div className="img-prompt-list-container">
         {mipr_list.map((prompt, index) => (
           <div key={index} className="prompt">
             <textarea spellCheck={false} name="image_prompt" id={`prompt-${index}`} value={prompt} readOnly>
               {prompt}
             </textarea>
             {
              copy?<i className='bx bx-copy-alt' style={{color:'#0ce1d7'}}  ></i>:
              <i className='bx bxs-copy' style={{color:'#0ce1d7'}} onClick={() => copyToClipboard(prompt)}></i>
             }
             
           </div>
         ))}
         </div>
         <button onClick={downloadPrompts}>Download Prompts</button>
       </div>
      ) : (
        <br />
      )}
    </div>
  );
};

export default PromptDownloader;
