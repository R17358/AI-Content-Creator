import axios from 'axios';

//https://ai-content-creator-9fz4.onrender.com/api


axios.defaults.withCredentials = true;
const instance = axios.create({
  baseURL: 'http://127.0.0.1:8080/api', 
  
});

export default instance;
