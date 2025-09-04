import React, { useState } from "react";
import { useWebSocket, type WSMessage } from "../hooks/useWebSocket";

const Chat: React.FC = () => {
  const { messages, sendMessage, connected } = useWebSocket();
  const [input, setInput] = useState<string>("");

  const handleSend = (role: "medico" | "paciente") => {
    if (input.trim() === "") return;
    sendMessage(role, input);
    setInput("");
  };

  return (
    <div>
      <h2>💬 Chat Médico / Paciente</h2>
      <p>Estado: {connected ? "🟢 Conectado" : "🔴 Desconectado"}</p>

      <div
        style={{
          border: "1px solid gray",
          padding: "10px",
          height: "200px",
          overflowY: "auto",
          marginBottom: "10px",
        }}>
        {messages.map((msg: WSMessage, idx: number) => (
          <div key={idx} bg-gray> 
            <b>{msg.role}:</b> {msg.content}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Escribe tu mensaje..."
      />

      <button onClick={() => handleSend("medico")} style={{ marginLeft: "5px" }}>
        Enviar como Médico
      </button>
      <button onClick={() => handleSend("paciente")} style={{ marginLeft: "5px" }}>
        Enviar como Paciente
      </button>
    </div>
  );
};

export default Chat;
