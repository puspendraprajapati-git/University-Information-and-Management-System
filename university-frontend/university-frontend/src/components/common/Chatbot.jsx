import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  Bot,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  BookOpen,
  Calendar,
  Award,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  ChevronRight
} from "lucide-react";
import { sendChatMessage, submitChatFeedback, escalateChatSession } from "../../services/chatService";

const QUICK_PROMPTS = [
  { label: "Check My Attendance", icon: CheckCircle, query: "Check my live attendance and 75% rule eligibility" },
  { label: "My Exam Results", icon: Award, query: "Show my semester exam results and GPA" },
  { label: "Today's Timetable", icon: Calendar, query: "What is my class schedule and room timetable today?" },
  { label: "Pending Tuition Fees", icon: BookOpen, query: "Show my pending tuition fee invoices and payment status" },
  { label: "Active Assignments", icon: BookOpen, query: "What homework assignments and project deadlines are due?" },
  { label: "Campus Placements", icon: Award, query: "What campus job openings and placement drives are active?" },
  { label: "Central Library Books", icon: BookOpen, query: "How many books can I borrow from the Central Library and what is the late fine?" },
  { label: "75% Attendance Rule", icon: AlertTriangle, query: "What is the university attendance requirement and condonation policy?" },
  { label: "Connect with Advisor", icon: UserCheck, query: "I would like to escalate my query to a faculty advisor" }
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      text: "Hello! I am **Medha AI**, your university student assistant. 🎓\n\nI can help you check your live **attendance**, **exam results**, **timetable**, explain **assignments**, retrieve **university regulations**, or connect you with a **faculty advisor**.\n\nHow can I help you today?",
      isBot: true,
      messageId: null,
      sources: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState({});

  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (textToSend = null) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { text: query, isBot: false }]);
    setLoading(true);

    try {
      const token = sessionStorage.getItem("token") || localStorage.getItem("token");
      const res = await sendChatMessage(query, token, sessionId);

      if (res.data) {
        if (res.data.session_id) {
          setSessionId(res.data.session_id);
        }

        setMessages((prev) => [
          ...prev,
          {
            text: res.data.reply || "I couldn't process that query. Please try again.",
            isBot: true,
            messageId: res.data.message_id,
            sources: res.data.sources || [],
            escalated: res.data.escalated,
            escalationId: res.data.escalation_id
          }
        ]);
      }
    } catch (err) {
      console.error("Chatbot API error:", err);
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ **Connection Error**: Unable to connect to the Medha AI assistant service. Please ensure the AI microservice is running on port 8000.",
          isBot: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSession = () => {
    setSessionId(null);
    setMessages([
      {
        text: "Session refreshed! I am **Medha AI**. How can I assist you with your academics or campus life?",
        isBot: true,
        messageId: null,
        sources: []
      }
    ]);
  };

  const handleFeedbackSubmit = async (messageId, rating, comment = null) => {
    if (!messageId) return;
    try {
      await submitChatFeedback(messageId, rating, comment);
      setFeedbackSent((prev) => ({ ...prev, [messageId]: rating }));
    } catch (err) {
      console.error("Feedback submit error:", err);
    }
  };

  const handleEscalateSession = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await escalateChatSession(sessionId, "FACULTY_ADVISOR", "Student requested human faculty support");
      setMessages((prev) => [
        ...prev,
        {
          text: `🎫 **Ticket #${res.data?.ticket_id || 'ESC-0001'} Created**\n\nYour session has been escalated to **Faculty Advisor**. A university staff member will review your chat history and contact you shortly.`,
          isBot: true,
          escalated: true
        }
      ]);
    } catch (err) {
      console.error("Escalate error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format basic markdown (bold, lists, tables, code)
  const renderFormattedText = (text) => {
    if (!text) return "";
    return (
      <div className="message-content">
        {text.split("\n").map((line, i) => {
          // Table row detection
          if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
            return (
              <div key={i} className="font-monospace small py-0.5 text-nowrap overflow-x-auto">
                {line}
              </div>
            );
          }
          // Markdown bold replacement
          const parts = line.split(/(\*\*.*?\*\*)/g);
          return (
            <p key={i} className="mb-1" style={{ minHeight: line ? "auto" : "0.5rem" }}>
              {parts.map((p, j) => {
                if (p.startsWith("**") && p.endsWith("**")) {
                  return <strong key={j}>{p.slice(2, -2)}</strong>;
                }
                if (p.startsWith("`") && p.endsWith("`")) {
                  return <code key={j} className="bg-light px-1 rounded text-dark border small">{p.slice(1, -1)}</code>;
                }
                return p;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={toggleChat}
        className="btn rounded-circle shadow-lg d-flex justify-content-center align-items-center position-fixed text-white"
        style={{
          bottom: "24px",
          right: "24px",
          width: "58px",
          height: "58px",
          zIndex: 1050,
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          border: "none",
          transition: "transform 0.2s ease, box-shadow 0.2s ease"
        }}
        title="Medha AI - Student Assistant"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="card shadow-lg border-0 rounded-4 overflow-hidden position-fixed"
          style={{
            bottom: "92px",
            right: "24px",
            width: "390px",
            height: "560px",
            maxWidth: "calc(100vw - 32px)",
            zIndex: 1050,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)"
          }}
        >
          {/* Header */}
          <div
            className="text-white p-3 d-flex justify-content-between align-items-center"
            style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)"
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 bg-white bg-opacity-10 backdrop-blur">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <div className="fw-bold d-flex align-items-center gap-1.5" style={{ fontSize: "0.95rem" }}>
                  <span>Medha AI</span>
                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill py-0 px-1.5" style={{ fontSize: "0.68rem" }}>
                    Online
                  </span>
                </div>
                <div className="text-white-50" style={{ fontSize: "0.72rem" }}>
                  AI Student Assistant & Academic Guide
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                onClick={handleResetSession}
                className="btn btn-sm text-white-50 hover-text-white p-1 border-0"
                title="Restart Session"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={toggleChat}
                className="btn btn-sm text-white-50 hover-text-white p-1 border-0"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-light border-bottom px-2 py-1.5 overflow-x-auto text-nowrap d-flex gap-1.5" style={{ fontSize: "0.75rem" }}>
            {QUICK_PROMPTS.slice(0, 4).map((p, idx) => (
              <button
                key={idx}
                className="btn btn-sm btn-outline-secondary bg-white border py-0.5 px-2 rounded-pill d-inline-flex align-items-center gap-1"
                style={{ fontSize: "0.72rem" }}
                onClick={() => handleSend(p.query)}
                disabled={loading}
              >
                <p.icon size={11} className="text-primary" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div
            className="card-body p-3 flex-grow-1 overflow-y-auto"
            style={{ backgroundColor: "#f8fafc" }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`d-flex mb-3 ${msg.isBot ? "justify-content-start" : "justify-content-end"}`}
              >
                <div
                  className={`p-3 rounded-4 shadow-sm ${
                    msg.isBot
                      ? "bg-white text-dark border border-slate-100"
                      : "bg-primary text-white"
                  }`}
                  style={{
                    maxWidth: "88%",
                    fontSize: "0.86rem",
                    lineHeight: "1.4"
                  }}
                >
                  {renderFormattedText(msg.text)}

                  {/* Sources & Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-top border-light-subtle small text-muted" style={{ fontSize: "0.72rem" }}>
                      <div className="fw-semibold text-uppercase text-secondary mb-1">References:</div>
                      {msg.sources.map((s, sIdx) => (
                        <div key={sIdx} className="d-flex align-items-center gap-1 text-primary">
                          <BookOpen size={11} />
                          <span>{s.source_title} {s.page ? `(Page ${s.page})` : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Escalation Confirmation */}
                  {msg.escalated && (
                    <div className="mt-2 p-2 rounded-3 bg-warning-subtle text-dark border border-warning small">
                      <strong>Advisor Alert:</strong> A faculty advisor has been assigned to your inquiry.
                    </div>
                  )}

                  {/* Feedback Ratings for Bot replies */}
                  {msg.isBot && msg.messageId && (
                    <div className="mt-2 pt-1.5 d-flex align-items-center justify-content-between border-top border-light-subtle" style={{ fontSize: "0.72rem" }}>
                      <span className="text-muted">Was this helpful?</span>
                      <div className="d-flex gap-1.5">
                        <button
                          className={`btn btn-sm p-0 border-0 ${feedbackSent[msg.messageId] === 5 ? 'text-success fw-bold' : 'text-muted'}`}
                          onClick={() => handleFeedbackSubmit(msg.messageId, 5)}
                          title="Helpful"
                        >
                          <ThumbsUp size={13} />
                        </button>
                        <button
                          className={`btn btn-sm p-0 border-0 ${feedbackSent[msg.messageId] === 1 ? 'text-danger fw-bold' : 'text-muted'}`}
                          onClick={() => handleFeedbackSubmit(msg.messageId, 1)}
                          title="Not helpful"
                        >
                          <ThumbsDown size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="d-flex justify-content-start mb-2">
                <div className="p-2.5 px-3 rounded-4 bg-white text-muted border small d-flex align-items-center gap-2 shadow-sm">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: "14px", height: "14px" }}></div>
                  <span style={{ fontSize: "0.8rem" }}>Medha AI is verifying university records...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Escalation Link */}
          {sessionId && (
            <div className="bg-white border-top px-3 py-1 d-flex justify-content-between align-items-center small" style={{ fontSize: "0.72rem" }}>
              <span className="text-muted">Need human assistance?</span>
              <button
                className="btn btn-link p-0 text-primary fw-semibold text-decoration-none d-flex align-items-center gap-0.5"
                style={{ fontSize: "0.72rem" }}
                onClick={handleEscalateSession}
              >
                <span>Escalate to Advisor</span>
                <ChevronRight size={12} />
              </button>
            </div>
          )}

          {/* Input Footer */}
          <div className="card-footer bg-white border-top p-2.5">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="d-flex gap-2 align-items-center">
              <input
                type="text"
                className="form-control form-control-sm rounded-pill px-3 py-1.5"
                placeholder="Ask about attendance, results, policies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                style={{ fontSize: "0.84rem" }}
              />
              <button
                type="submit"
                className="btn btn-primary rounded-circle p-0 d-flex justify-content-center align-items-center flex-shrink-0 text-white"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  border: "none"
                }}
                disabled={loading || !input.trim()}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
