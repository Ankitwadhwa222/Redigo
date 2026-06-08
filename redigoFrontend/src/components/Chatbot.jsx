import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot } from 'lucide-react';
import axios from 'axios';

const ATTRACT_MESSAGES = [
  "Need a ride? I've got you covered!",
  "Book, track or cancel — just ask!",
  "I'm your 24/7 Redigo helper 🚕",
];

const AttractBubble = () => {
  const [text, setText] = useState('');
  const [msgIdx, setMsgIdx] = useState(0);
  const charRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let erasing = false;

    const tick = () => {
      const msg = ATTRACT_MESSAGES[msgIdx];
      if (!erasing) {
        if (charRef.current <= msg.length) {
          setText(msg.slice(0, charRef.current));
          charRef.current++;
          timerRef.current = setTimeout(tick, 55);
        } else {
          timerRef.current = setTimeout(() => {
            erasing = true;
            tick();
          }, 2400);
        }
      } else {
        if (charRef.current >= 0) {
          setText(msg.slice(0, charRef.current));
          charRef.current--;
          timerRef.current = setTimeout(tick, 25);
        } else {
          erasing = false;
          setMsgIdx((prev) => (prev + 1) % ATTRACT_MESSAGES.length);
          charRef.current = 0;
          timerRef.current = setTimeout(tick, 400);
        }
      }
    };

    timerRef.current = setTimeout(tick, 600);
    return () => clearTimeout(timerRef.current);
  }, [msgIdx]);

  return (
    <div
      className="absolute bottom-20 right-0 z-50"
      style={{
        animation: 'attractFloatIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
    >
      <style>{`
        @keyframes attractFloatIn {
          from { transform: scale(0) translateY(8px); opacity: 0; }
          to   { transform: scale(1) translateY(0);  opacity: 1; }
        }
        @keyframes attractBobble {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-4px); }
        }
        @keyframes attractPing {
          0%   { transform: scale(1); opacity: 1; }
          70%  { transform: scale(1.9); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        @keyframes cursorBlink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0; }
        }
      `}</style>

      {/* Pointer arrow */}
      <div
        className="absolute -bottom-2 right-8 w-0 h-0"
        style={{
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '8px solid rgba(6,182,212,0.35)',
        }}
      />

      <div
        className="relative max-w-[230px] rounded-[18px_18px_4px_18px] p-3 mr-10"
        style={{
          background: 'rgba(15,23,42,0.85)',
          border: '1px solid rgba(6,182,212,0.35)',
          backdropFilter: 'blur(20px)',
          animation: 'attractBobble 3s ease-in-out 0.5s infinite',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        

        <p className="text-xs font-medium text-white mb-1">Hey there! 👋</p>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {text}
          <span
            style={{
              display: 'inline-block',
              width: '2px',
              height: '11px',
              background: '#06b6d4',
              marginLeft: '2px',
              verticalAlign: 'middle',
              animation: 'cursorBlink 0.7s step-end infinite',
            }}
          />
        </p>

        {/* Quick-action pills */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {['Book a ride', 'Track', 'Support'].map((label) => (
            <span
              key={label}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                border: '1px solid rgba(6,182,212,0.4)',
                color: '#67e8f9',
                background: 'rgba(6,182,212,0.08)',
              }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Redigo's AI assistant. How can I help you with your rides today? 🚗", sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 500);
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot`, {
        message: input,
      });
      setMessages((prev) => [...prev, { text: response.data.response, sender: 'bot' }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Sorry, I'm having trouble responding right now. Please try again.", sender: 'bot' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes chatWindowIn {
          from { transform: scale(0.85) translateY(16px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);    opacity: 1; }
        }
        @keyframes chatWindowOut {
          from { transform: scale(1)    translateY(0);    opacity: 1; }
          to   { transform: scale(0.85) translateY(16px); opacity: 0; }
        }
        @keyframes fabPulse {
          0%   { box-shadow: 0 0 0 0   rgba(6,182,212,0.5); }
          70%  { box-shadow: 0 0 0 14px rgba(6,182,212,0);  }
          100% { box-shadow: 0 0 0 0   rgba(6,182,212,0);   }
        }
        @keyframes msgIn {
          from { transform: scale(0.85) translateY(6px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);   opacity: 1; }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform: translateY(0); }
          40%         { transform: translateY(-6px); }
        }
        @keyframes statusPulse {
          0%,100% { box-shadow: 0 0 0 0   rgba(74,222,128,0.4); }
          50%     { box-shadow: 0 0 0 4px rgba(74,222,128,0);   }
        }
        .redigo-msg-in { animation: msgIn 0.3s cubic-bezier(0.34,1.3,0.64,1) forwards; }
        .redigo-dot-1  { animation: dotBounce 1.2s ease-in-out infinite; }
        .redigo-dot-2  { animation: dotBounce 1.2s ease-in-out 0.15s infinite; }
        .redigo-dot-3  { animation: dotBounce 1.2s ease-in-out 0.3s  infinite; }
        .redigo-status { animation: statusPulse 2s ease infinite; }
        .redigo-fab    { animation: fabPulse 2.2s ease-in-out infinite; }
        .redigo-fab:hover { animation: none; transform: scale(1.1); }
        .redigo-input:focus { outline: none; border-color: rgba(6,182,212,0.6) !important; background: rgba(255,255,255,0.12) !important; }
        .redigo-close:hover { background: rgba(255,255,255,0.14) !important; transform: rotate(90deg); }
      `}</style>


      {!isOpen && <AttractBubble />}

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-6 z-50 w-80"
          style={{
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(10,18,35,0.82)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)',
            animation: 'chatWindowIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
            transformOrigin: 'bottom right',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.22), rgba(13,148,136,0.18))',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #06b6d4, #0d9488)',
                }}
              >
                <Bot size={17} color="white" />
              </div>
              <span
                className="absolute bottom-0 right-0 redigo-status"
                style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: '#4ade80',
                  border: '2px solid rgba(10,18,35,0.9)',
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13, fontWeight: 500, color: '#fff', margin: 0 }}>Redigo Assistant</p>
              <p style={{ fontSize: 11, color: 'rgba(103,232,249,0.85)', margin: 0 }}>AI-Powered Support</p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="redigo-close transition-all duration-300 flex items-center justify-center"
              style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.75)',
                fontSize: 14, cursor: 'pointer', flexShrink: 0,
              }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              padding: '14px 14px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className="redigo-msg-in"
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  animationDelay: `${i * 40}ms`,
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '9px 13px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    ...(msg.sender === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #0891b2, #0d9488)',
                          color: '#fff',
                        }
                      : {
                          background: 'rgba(255,255,255,0.09)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.88)',
                        }),
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '16px 16px 16px 4px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    gap: 5,
                    alignItems: 'center',
                  }}
                >
                  <span className="redigo-dot-1" style={{ width: 7, height: 7, borderRadius: '50%', background: '#06b6d4', display: 'block' }} />
                  <span className="redigo-dot-2" style={{ width: 7, height: 7, borderRadius: '50%', background: '#0d9488', display: 'block' }} />
                  <span className="redigo-dot-3" style={{ width: 7, height: 7, borderRadius: '50%', background: '#14b8a6', display: 'block' }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>Redigo is typing…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '8px 12px 12px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              ref={inputRef}
              className="redigo-input transition-all duration-200"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me about rides..."
              disabled={isTyping}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '8px 12px',
                fontSize: 12,
                color: 'rgba(255,255,255,0.85)',
              }}
            />
            <button
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              style={{
                width: 34, height: 34, borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #06b6d4, #0d9488)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                opacity: input.trim() && !isTyping ? 1 : 0.45,
                transition: 'transform 0.15s, opacity 0.2s',
                flexShrink: 0,
              }}
            >
              <Send size={14} color="white" />
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="redigo-fab fixed bottom-6 right-6 z-50 transition-all duration-300 flex items-center justify-center"
        style={{
          width: 56, height: 56, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: isOpen
            ? 'linear-gradient(135deg, #0e7490, #0f766e)'
            : 'linear-gradient(135deg, #06b6d4, #0d9488)',
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen
          ? <X size={22} color="white" />
          : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          )
        }
      </button>
    </>
  );
};

export default Chatbot;