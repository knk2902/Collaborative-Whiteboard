// WebSocketService.ts
import { io } from 'socket.io-client';

const socket = io('ws://localhost:8080'); // WebSocket server URL

export default socket;
