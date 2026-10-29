import axios from "axios";

// This points to the API Gateway's AI proxy route (Port 5000 -> Port 8000)
const chatAxios = axios.create({
  baseURL: process.env.REACT_APP_AI_URL || "/ai",
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendChatMessage = async (message, token = null, sessionId = null) => {
  return await chatAxios.post("/chat", {
    message,
    token,
    session_id: sessionId
  });
};

export const submitChatFeedback = async (messageId, rating, comment = null) => {
  return await chatAxios.post("/chat/feedback", {
    message_id: messageId,
    rating,
    comment
  });
};

export const escalateChatSession = async (sessionId, assignedTo = "FACULTY_ADVISOR", reason = null) => {
  return await chatAxios.post("/chat/escalate", {
    session_id: sessionId,
    assigned_to: assignedTo,
    reason
  });
};

export const getChatHistory = async (sessionId) => {
  return await chatAxios.get(`/chat/history/${sessionId}`);
};

export const getKnowledgeDocuments = async () => {
  return await chatAxios.get("/documents");
};

export const uploadKnowledgeDocument = async (formData) => {
  return await chatAxios.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

const chatService = {
  sendChatMessage,
  submitChatFeedback,
  escalateChatSession,
  getChatHistory,
  getKnowledgeDocuments,
  uploadKnowledgeDocument
};

export default chatService;
