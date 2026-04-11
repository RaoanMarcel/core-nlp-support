// Backend/src/config/cors.ts
import cors from 'cors';

// Aqui você pode travar para só o seu frontend acessar a API no futuro!
const corsOptions = {
  origin: ['http://localhost:4321', 'http://localhost:5173'], // Portas comuns do Astro/Vite
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

export const corsMiddleware = cors(corsOptions);