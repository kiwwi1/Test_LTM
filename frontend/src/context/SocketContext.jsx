import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [onlinePlayers, setOnlinePlayers] = useState([]);
    const { token, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && token) {
            // Create socket connection
            const newSocket = io(SOCKET_URL, {
                auth: {
                    token: token,
                },
                transports: ['websocket', 'polling'],
            });

            newSocket.on('connect', () => {
                console.log('✅ Socket connected');
                setConnected(true);
                newSocket.emit('player:ready');
            });

            newSocket.on('disconnect', () => {
                console.log('❌ Socket disconnected');
                setConnected(false);
            });

            newSocket.on('player:list_update', (data) => {
                setOnlinePlayers(data.players || []);
            });

            newSocket.on('error', (error) => {
                console.error('Socket error:', error);
            });

            setSocket(newSocket);

            // Cleanup
            return () => {
                newSocket.close();
            };
        } else {
            // Disconnect if not authenticated
            if (socket) {
                socket.close();
                setSocket(null);
                setConnected(false);
            }
        }
    }, [isAuthenticated, token]);

    const value = {
        socket,
        connected,
        onlinePlayers,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

