"use client";

import { useState, useRef, useEffect } from "react";
import { MessageBubble, Role } from "@/components/MessageBubble";
import { MessageInput } from "@/components/MessageInput";
import { Canvas, CanvasData } from "@/components/Canvas";

interface Message {
  id: string;
  role: Role;
  text: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "ai",
      text: "Ahoj! Jsem tvůj AI asistent DouTok AI. Jak ti mohu dnes pomoci?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  
  // Auth State
  const [isAuthOpen, setIsAuthOpen] = useState(true); // Open by default
  const [isGuest, setIsGuest] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [userInfo, setUserInfo] = useState<{name: string, email: string} | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<CanvasData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleWallpaperUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setWallpaper(url);
    }
  };

  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePic(url);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Trying to hit the API, if it evaluates to 404 or errors out we fallback to mock
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text,
          history: messages.map(m => ({ role: m.role, text: m.text })) 
        })
      });

      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "ai", text: data.reply }
      ]);

      // If the API returned canvas data, open it after a short delay
      if (data.canvas) {
        setTimeout(() => {
          setCanvasData(data.canvas as CanvasData);
        }, 800);
      }
    } catch (error) {
      console.warn("API not reachable, using mock response", error);
      // Fallback mock response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "ai", text: `I received: "${text}"` }
        ]);
        setIsLoading(false);
      }, 1000);
      return; // return early so we don't clear loading state twice
    } 
    setIsLoading(false);
  };

  return (
    <div 
      className="app-container" 
      style={wallpaper ? { 
        backgroundImage: `url(${wallpaper})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        width: '100vw',
        height: '100vh'
      } : { width: '100vw', height: '100vh' }}
    >
      <header className="header">
        <div style={{ width: 80 }}></div> {/* Spacer to balance flex - 2 buttons on right */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ai-icon">
            <path d="M12 2C12 7.52 16.48 12 22 12C16.48 12 12 16.48 12 22C12 16.48 7.52 12 2 12C7.52 12 12 7.52 12 2Z" fill="#ff4d4d"/>
            <path d="M19 3C19 4.65 20.35 6 22 6C20.35 6 19 7.35 19 9C19 7.35 17.65 6 16 6C17.65 6 19 4.65 19 3Z" fill="#ff4d4d"/>
            <path d="M6 16C6 17.1 6.9 18 8 18C6.9 18 6 18.9 6 20C6 18.9 5.1 18 4 18C5.1 18 6 17.1 6 16Z" fill="#ff4d4d"/>
          </svg>
          <h1>DouTok AI</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <label className="wallpaper-btn" title="Set Wallpaper">
            <input type="file" accept="image/*" onChange={handleWallpaperUpload} style={{ display: 'none' }} />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
            </svg>
          </label>
          <button className="account-btn" onClick={() => setIsAccountOpen(true)} title="My Account">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </header>
      
      <main className="chat-container">
        <div className="chat-content">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} role={msg.role} text={msg.text} />
          ))}
          {isLoading && <MessageBubble role="ai" text="" isTyping={true} />}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <MessageInput onSend={handleSendMessage} disabled={isLoading} />

      {/* Account Modal Overlay */}
      {isAccountOpen && (
        <div className="modal-overlay" onClick={() => setIsAccountOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsAccountOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </button>
            <div className="account-header">
              <label className="account-avatar" title="Změnit profilovou fotku">
                <input type="file" accept="image/*" onChange={handleProfileUpload} style={{ display: 'none' }} />
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="avatar-image" />
                ) : (
                  userInfo ? userInfo.name.charAt(0).toUpperCase() : 'G'
                )}
              </label>
              <div className="account-info" style={{ textAlign: 'center' }}>
                <h2>{userInfo ? userInfo.name : 'Host (Anonym)'}</h2>
                <p>{userInfo ? userInfo.email : 'Nepřihlášený uživatel'}</p>
              </div>
            </div>
            <div className="account-stats">
              <div className="stat-item">
                <div className="stat-value">{messages.filter(m => m.role === 'user').length}</div>
                <div className="stat-label">Odesláno zpráv</div>
              </div>
              {!isGuest && (
                 <div className="stat-item">
                    <div className="stat-value">Aktivní</div>
                    <div className="stat-label">Stav účtu</div>
                 </div>
              )}
            </div>
            <div className="account-actions">
              <button className="action-btn" onClick={() => {
                setMessages([{ id: "init", role: "ai", text: "Ahoj! Jsem tvůj AI asistent DouTok AI. Historie byla úspěšně vymazána. Jak ti mohu dnes pomoci?" }]);
                setIsAccountOpen(false);
              }}>
                Vymazat historii konverzace
              </button>
              {isGuest ? (
                 <button className="action-btn" onClick={() => {
                    setIsAccountOpen(false);
                    setIsAuthOpen(true);
                 }}>
                    Přihlásit se / Vytvořit účet
                 </button>
              ) : (
                 <button className="action-btn logout" onClick={() => {
                    setUserInfo(null);
                    setIsGuest(true);
                    setIsAccountOpen(false);
                 }}>
                    Odhlásit se
                 </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal Overlay */}
      {isAuthOpen && (
        <div className="auth-overlay">
          <div className="auth-card">
            <div className="auth-header">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ai-icon">
                <path d="M12 2C12 7.52 16.48 12 22 12C16.48 12 12 16.48 12 22C12 16.48 7.52 12 2 12C7.52 12 12 7.52 12 2Z" fill="#ff4d4d"/>
              </svg>
              <h2>Vítej v DouTok AI</h2>
              <p>Přihlas se a odemkni plný potenciál svého chytrého asistenta, nebo pokračuj jednoduše jako host.</p>
            </div>
            <div className="auth-form">
              <input 
                 type="email" 
                 className="auth-input" 
                 placeholder="E-mailová adresa" 
                 value={authEmail}
                 onChange={(e) => setAuthEmail(e.target.value)}
              />
              <input type="password" className="auth-input" placeholder="Heslo" />
              <button className="auth-btn-primary" onClick={() => {
                 if(authEmail.includes('@')) {
                    setUserInfo({ name: authEmail.split('@')[0], email: authEmail });
                    setIsGuest(false);
                    setIsAuthOpen(false);
                 } else {
                    alert("Zadej prosím platný e-mail.");
                 }
              }}>
                Pokračovat
              </button>
              
              <div className="auth-divider">Nebo</div>
              
              <button className="auth-btn-skip" onClick={() => {
                 setIsGuest(true);
                 setUserInfo(null);
                 setIsAuthOpen(false);
              }}>
                Přeskočit a pokračovat jako host
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Overlay (Presentations & Apps) */}
      {canvasData && (
        <Canvas data={canvasData} onClose={() => setCanvasData(null)} />
      )}
    </div>
  );
}
