import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const INITIAL_POS = { x: window.innerWidth - 80, y: window.innerHeight - 100 };

const ChatBubble = () => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(INITIAL_POS);
  const [dragging, setDragging] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Xin chào! Mình có thể giúp gì cho bạn? 😊" },
  ]);
  const [input, setInput] = useState("");
  const bubbleRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const messagesEndRef = useRef(null);

  /* ─── drag ─── */
  const onMouseDown = (e) => {
    if (e.target.closest(".chat-panel")) return;
    e.preventDefault();
    hasDragged.current = false;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    setDragging(true);
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging) return;
      hasDragged.current = true;
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 56, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 56, e.clientY - dragOffset.current.y)),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const handleBubbleClick = () => {
    if (!hasDragged.current) setOpen((o) => !o);
  };

  /* ─── scroll ─── */
  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  /* ─── send ─── */
  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: "bot", text: "Cảm ơn bạn đã liên hệ! Mình sẽ phản hồi sớm nhất có thể. 🙏" },
      ]);
    }, 800);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ─── Panel position (open above/left of bubble) ─── */
  const panelRight = window.innerWidth - position.x - 56;
  const panelBottom = window.innerHeight - position.y + 8;

  return createPortal(
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="chat-panel"
          style={{
            position: "fixed",
            right: Math.max(8, panelRight),
            bottom: Math.max(8, panelBottom),
            width: 320,
            maxHeight: 420,
            background: "#fff",
            borderRadius: "1rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9998,
            border: "1px solid #e8e0f5",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              padding: "0.75rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <i className="bi bi-robot text-white" style={{ fontSize: "1.1rem" }} />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>
                Trợ lý TOEIC
              </div>
              <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.72rem" }}>
                Luôn sẵn sàng hỗ trợ bạn
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "1.1rem",
                cursor: "pointer",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              background: "#f8f7ff",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "0.5rem 0.75rem",
                    borderRadius:
                      msg.from === "user" ? "1rem 1rem 0.2rem 1rem" : "1rem 1rem 1rem 0.2rem",
                    background:
                      msg.from === "user"
                        ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                        : "#fff",
                    color: msg.from === "user" ? "#fff" : "#333",
                    fontSize: "0.85rem",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "0.6rem 0.75rem",
              borderTop: "1px solid #e8e0f5",
              display: "flex",
              gap: 6,
              background: "#fff",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Nhập tin nhắn..."
              style={{
                flex: 1,
                border: "1px solid #ddd",
                borderRadius: "2rem",
                padding: "0.4rem 0.75rem",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i className="bi bi-send-fill" style={{ fontSize: "0.85rem" }} />
            </button>
          </div>
        </div>
      )}

      {/* Floating bubble button */}
      <div
        ref={bubbleRef}
        onMouseDown={onMouseDown}
        onClick={handleBubbleClick}
        title="Chat hỗ trợ"
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: dragging ? "grabbing" : "grab",
          zIndex: 9999,
          transition: "box-shadow 0.2s",
          userSelect: "none",
        }}
      >
        <i
          className={`bi ${open ? "bi-x-lg" : "bi-chat-dots-fill"} text-white`}
          style={{ fontSize: "1.3rem" }}
        />
        {!open && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#22c55e",
              border: "2px solid #fff",
            }}
          />
        )}
      </div>
    </>,
    document.body
  );
};

export default ChatBubble;
