import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import CryptoJS from "crypto-js";
import "./App.css"; 

const socket = io("ws://127.0.0.1:8000/ws", { transports: ["websocket"] });

const key = "Sixteen byte key"; 

const encryptMessage = (message) => {
  const ciphertext = CryptoJS.AES.encrypt(message, key).toString();
  return btoa(ciphertext); 
};

const decryptMessage = (encryptedMessage) => {
  const bytes = CryptoJS.AES.decrypt(atob(encryptedMessage), key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("message", (encryptedMessage) => {
      const decryptedMessage = decryptMessage(encryptedMessage);
      setMessages((prev) => [...prev, decryptedMessage]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() !== "") {
      const encryptedMessage = encryptMessage(message);
      socket.send(encryptedMessage);
      setMessages((prev) => [...prev, `You: ${message}`]);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <h2>Secure Chat</h2>
      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">{msg}</div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;