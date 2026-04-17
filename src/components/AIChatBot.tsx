'use client';
import { useState } from 'react';

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inquiry, setInquiry] = useState('');
  const [messages, setMessages] = useState<{role: 'user'|'bot', text: string}[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiry.trim() || loading) return;

    const userMsg = inquiry.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInquiry('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: `Error: ${data.error}` }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Network connection failed.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: 'linear-gradient(135deg, #4f9fff, #2060cc)',
          color: 'white', border: 'none', borderRadius: '50%',
          width: 56, height: 56, fontSize: '1.5rem', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(79, 159, 255, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        aria-label="Toggle AI Assistant"
      >
        ✨
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 100,
          width: 320, background: '#121926', border: '1px solid #1e293b',
          borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }}>
          {/* Header */}
          <div style={{
            background: '#1a2233', padding: '16px', borderBottom: '1px solid #1e293b',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#e8edf5', display: 'flex', alignItems: 'center', gap: 8 }}>
              CrowdBot AI <span style={{fontSize: 10, background: '#4f9fff', color: '#080e1a', padding: '2px 6px', borderRadius: 4, fontWeight: 700}}>GEMINI</span>
            </h3>
            <button onClick={() => setIsOpen(false)} style={{background: 'none', border: 'none', color: '#8899aa', cursor: 'pointer'}}>✕</button>
          </div>

          {/* Messages Area */}
          <div style={{ height: 250, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 ? (
              <p style={{ color: '#8899aa', fontSize: '0.85rem', textAlign: 'center', marginTop: 40 }}>
                Ask me anything about gate locations, wait times, or stadium rules!
              </p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? '#4f9fff' : '#1e293b',
                  color: msg.role === 'user' ? '#0a101d' : '#e8edf5',
                  padding: '8px 12px', borderRadius: 12, maxWidth: '85%',
                  fontSize: '0.85rem', lineHeight: 1.4
                }}>
                  {msg.text}
                </div>
              ))
            )}
            {loading && <div style={{ alignSelf: 'flex-start', color: '#8899aa', fontSize: '0.8rem' }}>Typing...</div>}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{ display: 'flex', padding: 12, borderTop: '1px solid #1e293b' }}>
            <input 
              type="text" 
              value={inquiry}
              onChange={(e) => setInquiry(e.target.value)}
              placeholder="Type your question..."
              style={{
                flex: 1, background: '#0a101d', border: '1px solid #1e293b',
                color: '#e8edf5', padding: '10px 12px', borderRadius: 8, fontSize: '0.85rem'
              }}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !inquiry.trim()} style={{
              background: 'transparent', border: 'none', color: inquiry.trim() ? '#4f9fff' : '#475569',
              padding: '0 12px', cursor: inquiry.trim() ? 'pointer' : 'not-allowed', fontSize: '1.2rem'
            }}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}
