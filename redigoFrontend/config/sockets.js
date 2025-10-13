import {io} from 'socket.io-client';

const SOCKET_URL = `${import.meta.env.BACKEND_URL}`;

export const socket = io(SOCKET_URL, {
     transports: ['websocket'],
});