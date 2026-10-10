import axios from 'axios';
import { OPENAI_API as apiKey } from '@env';

const baseURL = 'https://api.openai.com/v1/chat/completions';

const chatGPTClient = axios.create({
  baseURL,
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

export default chatGPTClient;
