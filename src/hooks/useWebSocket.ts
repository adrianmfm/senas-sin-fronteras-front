import { useEffect, useRef, useState, useCallback } from "react";

export type Role = "medico" | "paciente" | "server" | "unknown";

export type WSMessage = {
  role: Role;
  content: string;
};

export const useWebSocket = (
  url: string = "ws://localhost:3001" // ⚡ WebSocket puro
) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      try {
        const msg: WSMessage = JSON.parse(e.data);
        setMessages((prev) => [...prev, msg]);
      } catch {
        setMessages((prev) => [...prev, { role: "unknown", content: e.data }]);
      }
    };

    return () => ws.close();
  }, [url]);

  const sendMessage = useCallback((role: Role, content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const msg: WSMessage = { role, content };
    wsRef.current.send(JSON.stringify(msg));
  }, []);

  return { messages, sendMessage, connected };
};
