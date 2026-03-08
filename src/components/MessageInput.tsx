import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSend(`📎 [Soubor: ${file.name}]`);
      setShowMenu(false);
    }
  };

  const handleAction = (action: string) => {
    setShowMenu(false);
    switch (action) {
      case 'presentation':
        onSend('Vytvoř mi prezentaci na téma...');
        break;
      case 'game':
        onSend('Vytvoř mi jednoduchou hru...');
        break;
    }
  };

  return (
    <div className="input-container animate-fade-in">
      <form className="input-form glass-panel" onSubmit={handleSubmit}>
        
        {/* Plus button */}
        <div className="plus-menu-wrapper" ref={menuRef}>
          <button 
            type="button" 
            className="plus-btn"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="More actions"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
              style={{ transform: showMenu ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="plus-dropdown">
              <label className="plus-dropdown-item">
                <input type="file" accept="image/*,video/*" onChange={handleFileSelect} style={{ display: 'none' }} ref={fileInputRef} />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/></svg>
                <span>Nahrát fotku</span>
              </label>
              <label className="plus-dropdown-item">
                <input type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 16H16V18H8V16ZM8 12H16V14H8V12ZM14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill="currentColor"/></svg>
                <span>Nahrát soubor</span>
              </label>
              <div className="plus-dropdown-divider" />
              <button type="button" className="plus-dropdown-item" onClick={() => handleAction('presentation')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM13 7H18V9H13V7ZM13 11H18V13H13V11ZM6 7H11V13H6V7ZM6 15H18V17H6V15Z" fill="currentColor"/></svg>
                <span>Vytvořit prezentaci</span>
              </button>
              <button type="button" className="plus-dropdown-item" onClick={() => handleAction('game')}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 6H3C1.9 6 1 6.9 1 8V16C1 17.1 1.9 18 3 18H21C22.1 18 23 17.1 23 16V8C23 6.9 22.1 6 21 6ZM11 13H8V16H6V13H3V11H6V8H8V11H11V13ZM15.5 16C14.67 16 14 15.33 14 14.5C14 13.67 14.67 13 15.5 13C16.33 13 17 13.67 17 14.5C17 15.33 16.33 16 15.5 16ZM19.5 13C18.67 13 18 12.33 18 11.5C18 10.67 18.67 10 19.5 10C20.33 10 21 10.67 21 11.5C21 12.33 20.33 13 19.5 13Z" fill="currentColor"/></svg>
                <span>Vytvořit hru</span>
              </button>
            </div>
          )}
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Napiš zprávu..."
          disabled={disabled}
          rows={1}
        />
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={!text.trim() || disabled}
          aria-label="Send message"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
