import {createContext, useContext, ReactNode, useRef} from 'react';
// @ts-ignore
import useWebSocket, { SendJsonMessage } from 'react-use-websocket';
import { BACKEND } from './consts.ts';

interface WebSocketContextType {
    sendJsonMessage: SendJsonMessage; // Correctly type sendJsonMessage from react-use-websocket
    messages: any; // Or a more specific type if you know the structure of your messages
    gamestate: any
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
    children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
    const messages = useRef<JSON>()
    const gamestate = useRef<boolean>(false)
    const { sendJsonMessage } = useWebSocket(BACKEND, {
        shouldReconnect: () => true,
        onMessage: (msg) => { messages.current = JSON.parse(msg.data)} // Ensure msg.data gets assigned to message correctly
    });
        return (
            <WebSocketContext.Provider value={{sendJsonMessage, messages, gamestate}}>
                {children}
            </WebSocketContext.Provider>
        );

}

// Custom hook for consuming the context
export const useWebSocketContext = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocketContext must be used within a WebSocketProvider');
    }
    return context;
};
