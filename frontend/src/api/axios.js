import axios from 'axios';

axios.defaults.withCredentials = true;
const instance = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', 
  
});

export default instance;
