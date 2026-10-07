import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiPort=Number(process.env.API_PORT)||3917;

export default defineConfig({
  plugins:[react()],
  server:{
    host:'0.0.0.0',
    proxy:{'/api':`http://127.0.0.1:${apiPort}`,'/uploads':`http://127.0.0.1:${apiPort}`},
  },
});
