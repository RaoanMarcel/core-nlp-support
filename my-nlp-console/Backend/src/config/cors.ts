// Backend/src/config/cors.ts
import cors from 'cors';

const corsOptions = {
  origin: ['http://localhost:4321', 'http://localhost:5173', 'https://corenpl.netlify.app'], 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

export const corsMiddleware = cors(corsOptions);