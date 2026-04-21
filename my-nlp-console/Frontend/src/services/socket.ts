import { io } from 'socket.io-client';

const baseURL = import.meta.env?.PUBLIC_API_URL || import.meta.env?.VITE_API_URL || 'https://core-nlp-support.onrender.com';

export const socket = io(baseURL, { autoConnect: false });