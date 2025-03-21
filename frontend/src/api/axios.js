import axios from 'axios';

axios.defaults.withCredentials = true;
const instance = axios.create({
  baseURL: 'https://ai-content-creator-9fz4.onrender.com/api', 
  
});

export default instance;
