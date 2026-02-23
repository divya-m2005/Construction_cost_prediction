import React, { useState } from 'react';

const getStyles = (isDark) => ({
    container: {
        position: 'fixed',
        bottom: '90px',
        right: '25px',
        width: '380px',
        height: '550px',
        background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.6)' : '0 10px 40px rgba(0,0,0,0.1)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        zIndex: 2000,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    header: {
        padding: '20px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
    },
    messages: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'transparent'
    },
    message: (isBot) => ({
        alignSelf: isBot ? 'flex-start' : 'flex-end',
        background: isBot
            ? (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9')
            : 'linear-gradient(135deg, #3b82f6, #2563eb)',
        padding: '12px 16px',
        borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
        maxWidth: '85%',
        fontSize: '14px',
        lineHeight: '1.5',
        color: isBot ? (isDark ? '#e2e8f0' : '#1e293b') : '#fff',
        fontWeight: isBot ? '500' : '600',
        boxShadow: isBot ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.2)',
        border: isBot && !isDark ? '1px solid #e2e8f0' : 'none'
    }),
    inputArea: {
        padding: '16px 20px',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
        display: 'flex',
        gap: '12px',
        background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
    },
    input: {
        flex: 1,
        background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
        border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
        borderRadius: '12px',
        padding: '10px 14px',
        color: isDark ? '#fff' : '#1e293b',
        outline: 'none',
        fontSize: '14px',
        transition: 'border-color 0.2s ease'
    },
    toggle: {
        position: 'fixed',
        bottom: '25px',
        right: '25px',
        width: '60px',
        height: '60px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#fff',
        fontSize: '28px',
        boxShadow: '0 10px 30px rgba(37, 99, 235, 0.4)',
        zIndex: 2000,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        border: 'none'
    }
});

const Chatbot = ({ onSystemFill, isDark }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your AI Construction Assistant. Tell me about your project!", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const STYLES = getStyles(isDark);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
        setInput('');

        try {
            const response = await fetch('http://127.0.0.1:8000/ai/parse-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg })
            });
            const data = await response.json();


            if (data.auto_fill) {
                onSystemFill(data.auto_fill);
                setMessages(prev => [...prev, { text: "I've analyzed your requirements and auto-filled the form! Check the prediction results.", isBot: true }]);
            } else {
                setMessages(prev => [...prev, { text: "I couldn't identify all the project details. Try specifying area and floor count.", isBot: true }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { text: "I'm having trouble reaching my AI intelligence core right now.", isBot: true }]);
        }
    };

    if (!isOpen) {
        return (
            <button
                style={STYLES.toggle}
                onClick={() => setIsOpen(true)}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 15px 40px rgba(37, 99, 235, 0.5)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.4)'; }}
            >
                💬
            </button>
        );
    }

    return (
        <div style={STYLES.container}>
            <div style={STYLES.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>🤖</span>
                    <div>
                        <div style={{ fontWeight: '800', fontSize: '15px' }}>AI Assistant</div>
                        <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: '600' }}>Always Online</div>
                    </div>
                </div>
                <button
                    style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                    onClick={() => setIsOpen(false)}
                >
                    ✕
                </button>
            </div>
            <div style={STYLES.messages}>
                {messages.map((m, i) => (
                    <div key={i} style={STYLES.message(m.isBot)}>{m.text}</div>
                ))}
            </div>
            <div style={STYLES.inputArea}>
                <input
                    style={STYLES.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="E.g. 2 floor villa in Pune..."
                />
                <button
                    onClick={handleSend}
                    style={{ background: '#2563eb', border: 'none', color: '#fff', padding: '0 16px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s ease' }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
