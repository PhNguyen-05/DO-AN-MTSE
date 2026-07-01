import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn về luyện thi TOEIC?' }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: 'user', text: input };
    setMessages(msgs => [...msgs, userMsg]);
    setInput('');
    // Gửi tới backend
    try {
      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { from: 'bot', text: data.reply }]);
    } catch {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Lỗi kết nối máy chủ.' }]);
    }
  };

  return (
    <>
      <div className={`chat-bubble${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span role="img" aria-label="chat">💬</span>
      </div>
      {open && (
        <div className="chat-widget">
          <div className="chat-header">Chat TOEIC AI</div>
          <div className="chat-body">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.from}`}>{msg.text}</div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form className="chat-input" onSubmit={sendMessage}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Nhập tin nhắn..." />
            <button type="submit">Gửi</button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
