import axios from "axios";

// This points to the API Gateway's AI proxy route
const chatAxios = axios.create({
  baseURL: process.env.REACT_APP_AI_URL || "/ai",
  headers: {
    "Content-Type": "application/json",
  },
});

export const sendChatMessage = async (message, token) => {
  const response = await chatAxios.post("/chat", { message, token });
  return response; // Return full response object for consistency
};
