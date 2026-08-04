import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../../services/chatService";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I am EduCore-Bot. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call the AI Microservice via the API Gateway
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await sendChatMessage(userMessage.text, token);
      const botMessage = { text: res.data.reply, isBot: true };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, I am having trouble connecting to the AI brain.", isBot: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className="btn btn-primary rounded-circle shadow-lg d-flex justify-content-center align-items-center"
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          zIndex: 1000,
          fontSize: "24px"
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="card shadow-lg"
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            width: "350px",
            height: "450px",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* Chat Header */}
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3 px-4">
            <span className="fw-bold">EduCore AI Assistant</span>
            <button
              onClick={toggleChat}
              className="btn-close btn-close-white"
              style={{ fontSize: "0.8rem" }}
            ></button>
          </div>

          {/* Chat Messages */}
          <div
            className="card-body p-3 flex-grow-1"
            style={{ overflowY: "auto", backgroundColor: "#f8f9fa" }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`d-flex mb-3 ${msg.isBot ? "justify-content-start" : "justify-content-end"}`}
              >
                <div
                  className={`p-3 rounded-4 shadow-sm ${
                    msg.isBot ? "bg-white text-dark" : "bg-primary text-white"
                  }`}
                  style={{
                    maxWidth: "80%",
                    fontSize: "0.9rem",
                    borderBottomLeftRadius: msg.isBot ? "2px" : "16px",
                    borderBottomRightRadius: msg.isBot ? "16px" : "2px"
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="d-flex justify-content-start mb-3">
                <div className="p-3 rounded-4 bg-white shadow-sm text-muted" style={{ fontSize: "0.9rem", borderBottomLeftRadius: "2px" }}>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="card-footer bg-white border-top-0 p-3">
            <form onSubmit={handleSend} className="d-flex gap-2">
              <input
                type="text"
                className="form-control rounded-pill border-light bg-light px-3"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary rounded-circle p-2 d-flex justify-content-center align-items-center"
                style={{ width: "40px", height: "40px" }}
                disabled={loading}
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
