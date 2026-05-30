'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ───── TYPES ───── */
interface ChatMessage { role: 'bot' | 'user'; text: string }
interface HackStep {
  botMessage: string;
  codeHint: string;
  terminalLines: string[];
  progressAdd: number;
  passwordReveal: number;
}

/* ───── CONSTANTS ───── */
const LANGUAGES = [
  'Python','JavaScript','TypeScript','Java','C','C++','C#','Rust','Go',
  'Ruby','PHP','Swift','Kotlin','Dart','Lua','Perl','R','Scala',
  'Haskell','Assembly','SQL','Bash','PowerShell','Julia','Elixir','Zig',
];

const TARGET_PASSWORD = 'Kx#9$mPw2!';

const ERROR_MESSAGES = [
  'That doesn\'t look right. Check the syntax carefully. Try:\n`{hint}`',
  'Hmm, invalid command. The correct input should be:\n`{hint}`',
  'Syntax error detected. Double-check and enter:\n`{hint}`',
  'Command not recognized. You need to type:\n`{hint}`',
  'That won\'t work, operative. The expected command is:\n`{hint}`',
  'Incorrect input. Look closely — you need:\n`{hint}`',
  'Nope, try again. The right command is:\n`{hint}`',
  'Error: unrecognized instruction. Enter this instead:\n`{hint}`',
];

const SUCCESS_PREFIXES = [
  'Perfect!',
  'Excellent work!',
  'Nice one, operative!',
  'Well done!',
  'That\'s it!',
  'Executed successfully!',
  'Good job!',
  'Right on target!',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isInputCorrect(input: string, expected: string): boolean {
  const clean = (s: string) => s.trim().replace(/[\s;]+$/g, '').replace(/["']/g, '').toLowerCase();
  const a = clean(input);
  const b = clean(expected);
  if (a === b) return true;
  // Extract key identifiers from the expected code and check if most are present
  const keywords = b.split(/[^a-zA-Z0-9_]+/).filter(w => w.length > 2);
  const matchCount = keywords.filter(kw => a.includes(kw)).length;
  return keywords.length > 0 && matchCount / keywords.length >= 0.6;
}

function getSyntax(lang: string) {
  const l = lang.toLowerCase();
  const map: Record<string, { imp: string; init: string; scan: string; exploit: string; crack: string; connect: string }> = {
    python: {
      imp: 'import konopix_breach as kb',
      init: 'scanner = kb.NetworkScanner("192.168.1.0/24")',
      scan: 'vulns = scanner.scan_ports([22, 80, 443, 8080])',
      exploit: 'exploit = kb.SSHExploit(vulns[0])',
      crack: 'password = exploit.brute_force("rockyou.txt")',
      connect: 'session = exploit.connect("konopix@corporation.com", password)',
    },
    javascript: {
      imp: 'const kb = require("konopix-breach");',
      init: 'const scanner = new kb.NetworkScanner("192.168.1.0/24");',
      scan: 'const vulns = await scanner.scanPorts([22, 80, 443, 8080]);',
      exploit: 'const exploit = new kb.SSHExploit(vulns[0]);',
      crack: 'const password = await exploit.bruteForce("rockyou.txt");',
      connect: 'const session = await exploit.connect("konopix@corporation.com", password);',
    },
    typescript: {
      imp: 'import { BreachKit } from "konopix-breach";',
      init: 'const scanner = new BreachKit.Scanner("192.168.1.0/24");',
      scan: 'const vulns: Vulnerability[] = await scanner.scanPorts([22, 80, 443]);',
      exploit: 'const exploit = new BreachKit.SSHExploit(vulns[0]);',
      crack: 'const password: string = await exploit.bruteForce("rockyou.txt");',
      connect: 'const session = await exploit.connect("konopix@corporation.com", password);',
    },
    java: {
      imp: 'import com.konopix.breach.*;',
      init: 'NetworkScanner scanner = new NetworkScanner("192.168.1.0/24");',
      scan: 'List<Vuln> vulns = scanner.scanPorts(new int[]{22, 80, 443, 8080});',
      exploit: 'SSHExploit exploit = new SSHExploit(vulns.get(0));',
      crack: 'String password = exploit.bruteForce("rockyou.txt");',
      connect: 'Session session = exploit.connect("konopix@corporation.com", password);',
    },
    rust: {
      imp: 'use konopix_breach::{Scanner, SSHExploit};',
      init: 'let scanner = Scanner::new("192.168.1.0/24");',
      scan: 'let vulns = scanner.scan_ports(&[22, 80, 443, 8080]).await?;',
      exploit: 'let exploit = SSHExploit::new(&vulns[0]);',
      crack: 'let password = exploit.brute_force("rockyou.txt").await?;',
      connect: 'let session = exploit.connect("konopix@corporation.com", &password).await?;',
    },
    'c++': {
      imp: '#include <konopix/breach.hpp>',
      init: 'auto scanner = kb::NetworkScanner("192.168.1.0/24");',
      scan: 'auto vulns = scanner.scan_ports({22, 80, 443, 8080});',
      exploit: 'auto exploit = kb::SSHExploit(vulns[0]);',
      crack: 'auto password = exploit.brute_force("rockyou.txt");',
      connect: 'auto session = exploit.connect("konopix@corporation.com", password);',
    },
    c: {
      imp: '#include <konopix_breach.h>',
      init: 'kb_scanner_t* scanner = kb_scanner_new("192.168.1.0/24");',
      scan: 'kb_vuln_t* vulns = kb_scan_ports(scanner, ports, 4);',
      exploit: 'kb_exploit_t* exploit = kb_ssh_exploit(vulns[0]);',
      crack: 'char* password = kb_brute_force(exploit, "rockyou.txt");',
      connect: 'kb_session_t* session = kb_connect("konopix@corporation.com", password);',
    },
    go: {
      imp: 'import "github.com/konopix/breach"',
      init: 'scanner := breach.NewScanner("192.168.1.0/24")',
      scan: 'vulns, err := scanner.ScanPorts([]int{22, 80, 443, 8080})',
      exploit: 'exploit := breach.NewSSHExploit(vulns[0])',
      crack: 'password, err := exploit.BruteForce("rockyou.txt")',
      connect: 'session, err := exploit.Connect("konopix@corporation.com", password)',
    },
    bash: {
      imp: 'source /opt/konopix/breach.sh',
      init: 'kb_init_scanner "192.168.1.0/24"',
      scan: 'kb_scan_ports 22 80 443 8080',
      exploit: 'kb_exploit_ssh $VULN_TARGET',
      crack: 'kb_brute_force --wordlist rockyou.txt',
      connect: 'kb_connect konopix@corporation.com $PASSWORD',
    },
  };

  const fallback = {
    imp: `import konopix_breach`,
    init: `scanner = new NetworkScanner("192.168.1.0/24")`,
    scan: `vulns = scanner.scanPorts([22, 80, 443, 8080])`,
    exploit: `exploit = new SSHExploit(vulns[0])`,
    crack: `password = exploit.bruteForce("rockyou.txt")`,
    connect: `session = exploit.connect("konopix@corporation.com", password)`,
  };

  return map[l] || fallback;
}

function getSteps(lang: string): HackStep[] {
  const s = getSyntax(lang);
  return [
    {
      botMessage: `Great choice — ${lang}! Let's breach the Konopix Corporation. First, import the breach module:\n\`${s.imp}\``,
      codeHint: s.imp,
      terminalLines: [
        '> Loading breach module...',
        '> Module loaded successfully ✓',
      ],
      progressAdd: 5,
      passwordReveal: 0,
    },
    {
      botMessage: `Module is ready. Now initialize the network scanner to map the target subnet:\n\`${s.init}\``,
      codeHint: s.init,
      terminalLines: [
        '> Initializing network scanner...',
        '> Target subnet: 192.168.1.0/24',
        '> Scanner ready ✓',
      ],
      progressAdd: 10,
      passwordReveal: 0,
    },
    {
      botMessage: `Scanner is online. Scan for open ports and vulnerabilities:\n\`${s.scan}\``,
      codeHint: s.scan,
      terminalLines: [
        '> Scanning 256 hosts...',
        '> Host 192.168.1.105 — ONLINE',
        '> Port 22/tcp  OPEN  ssh',
        '> Port 80/tcp  OPEN  http',
        '> Port 443/tcp OPEN  https',
        '> Port 8080/tcp OPEN  proxy',
        '> Found 3 vulnerabilities ⚠',
      ],
      progressAdd: 20,
      passwordReveal: 2,
    },
    {
      botMessage: `Vulnerabilities found! Deploy the SSH exploit on the weakest target:\n\`${s.exploit}\``,
      codeHint: s.exploit,
      terminalLines: [
        '> Deploying SSH exploit...',
        '> Target: 192.168.1.105:22',
        '> CVE-2024-3721 — Buffer overflow in OpenSSH 8.2',
        '> Exploit payload injected ✓',
      ],
      progressAdd: 20,
      passwordReveal: 3,
    },
    {
      botMessage: `Exploit deployed! Now crack the password using brute force:\n\`${s.crack}\``,
      codeHint: s.crack,
      terminalLines: [
        '> Starting brute-force attack...',
        '> Wordlist: rockyou.txt (14,341,564 entries)',
        '> Attempt 847,293 — testing "summer2024"',
        '> Attempt 1,204,871 — testing "konopix!!"',
        `> PASSWORD FOUND: ${TARGET_PASSWORD} ✓`,
      ],
      progressAdd: 25,
      passwordReveal: TARGET_PASSWORD.length,
    },
    {
      botMessage: `Password cracked! Final step — connect to the system:\n\`${s.connect}\``,
      codeHint: s.connect,
      terminalLines: [
        '> Establishing SSH connection...',
        '> Authenticating konopix@corporation.com...',
        '> Authentication successful ✓',
        '> ═══════════════════════════════',
        '> ██ ACCESS GRANTED ██',
        '> ═══════════════════════════════',
        '> Welcome to Konopix Corporation',
        '> root@konopix-corp:~$ _',
      ],
      progressAdd: 20,
      passwordReveal: 0,
    },
  ];
}

/* ───── COMPONENT ───── */
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'Welcome, operative. Select a programming language from the menu above to begin your breach.' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '> Konopix Breach Terminal v3.7.1',
    '> Waiting for instructions...',
  ]);
  const [revealedPw, setRevealedPw] = useState(0);
  const [accessGranted, setAccessGranted] = useState(false);
  const [networkActivity, setNetworkActivity] = useState<string[]>([]);

  const chatRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat & terminal
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);
  useEffect(() => {
    termRef.current?.scrollTo({ top: termRef.current.scrollHeight, behavior: 'smooth' });
  }, [terminalLines]);

  // Network activity simulation
  useEffect(() => {
    if (!selectedLang || accessGranted) return;
    const ips = ['10.0.0.1','192.168.1.105','172.16.0.42','10.10.10.1'];
    const protocols = ['TCP','UDP','SSH','HTTPS'];
    const iv = setInterval(() => {
      const src = ips[Math.floor(Math.random() * ips.length)];
      const dst = ips[Math.floor(Math.random() * ips.length)];
      const proto = protocols[Math.floor(Math.random() * protocols.length)];
      const bytes = Math.floor(Math.random() * 9999) + 64;
      setNetworkActivity(prev => [...prev.slice(-6), `${proto} ${src} → ${dst} [${bytes}B]`]);
    }, 1800);
    return () => clearInterval(iv);
  }, [selectedLang, accessGranted]);

  const selectLanguage = useCallback((lang: string) => {
    setSelectedLang(lang);
    setMenuOpen(false);
    setStep(0);
    setProgress(0);
    setRevealedPw(0);
    setAccessGranted(false);
    setTerminalLines(['> Konopix Breach Terminal v3.7.1', `> Language: ${lang}`, '> Ready for instructions...']);
    setNetworkActivity([]);
    const steps = getSteps(lang);
    setMessages([
      { role: 'bot', text: 'Welcome, operative. Select a programming language from the menu above to begin your breach.' },
      { role: 'bot', text: steps[0].botMessage },
    ]);
  }, []);

  const resetAll = useCallback(() => {
    setSelectedLang(null);
    setMenuOpen(false);
    setStep(0);
    setProgress(0);
    setRevealedPw(0);
    setAccessGranted(false);
    setTerminalLines(['> Konopix Breach Terminal v3.7.1', '> Waiting for instructions...']);
    setNetworkActivity([]);
    setUserInput('');
    setMessages([
      { role: 'bot', text: 'Welcome, operative. Select a programming language from the menu above to begin your breach.' },
    ]);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!userInput.trim() || !selectedLang) return;
    const steps = getSteps(selectedLang);
    if (step >= steps.length) return;

    const currentStep = steps[step];
    const trimmedInput = userInput.trim();
    setMessages(prev => [...prev, { role: 'user', text: trimmedInput }]);

    // Validate input
    if (!isInputCorrect(trimmedInput, currentStep.codeHint)) {
      // Wrong input — show error with varied message
      const errMsg = pickRandom(ERROR_MESSAGES).replace('{hint}', currentStep.codeHint);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: errMsg }]);
        setTerminalLines(prev => [...prev, `> ERROR: Invalid command — "${trimmedInput.slice(0, 40)}..."`]);
      }, 400);
      setUserInput('');
      return;
    }

    // Correct input — animate with varied success prefix
    const successPrefix = pickRandom(SUCCESS_PREFIXES);

    // Animate terminal lines with delay
    currentStep.terminalLines.forEach((line, i) => {
      setTimeout(() => {
        setTerminalLines(prev => [...prev, line]);
      }, (i + 1) * 400);
    });

    // Update progress
    setTimeout(() => {
      setProgress(prev => Math.min(prev + currentStep.progressAdd, 100));
      setRevealedPw(prev => Math.min(prev + currentStep.passwordReveal, TARGET_PASSWORD.length));
    }, currentStep.terminalLines.length * 400);

    const nextStep = step + 1;
    if (nextStep < steps.length) {
      setTimeout(() => {
        const nextMsg = steps[nextStep].botMessage;
        setMessages(prev => [...prev, { role: 'bot', text: `${successPrefix} ${nextMsg}` }]);
        setStep(nextStep);
      }, currentStep.terminalLines.length * 400 + 600);
    } else {
      // Hack complete!
      setTimeout(() => {
        setAccessGranted(true);
        setMessages(prev => [...prev, { role: 'bot', text: '🎉 ACCESS GRANTED! You have successfully breached the Konopix Corporation system. Well done, operative.' }]);
        setStep(nextStep);
      }, currentStep.terminalLines.length * 400 + 600);
    }

    setUserInput('');
  }, [userInput, selectedLang, step]);

  const passwordDisplay = TARGET_PASSWORD.split('').map((c, i) =>
    i < revealedPw ? c : '•'
  ).join('');

  return (
    <>
      {/* ══════ HEADER ══════ */}
      <header className="header">
        <div className="header-logo">
          <img src="/logo.png" alt="Konopix Logo" />
          <span>Konopix Hack-In Simulator</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="reset-btn" onClick={resetAll}>
            ↺ Reset
          </button>

          <div className="dropdown-container">
            <button
              className={`dropdown-btn ${selectedLang ? 'active' : ''}`}
              onClick={() => setMenuOpen(prev => !prev)}
            >
              {selectedLang || 'Programming Languages'}
              <span className={`dropdown-arrow ${menuOpen ? 'open' : ''}`}>▼</span>
            </button>

            {menuOpen && (
              <div className="dropdown-menu">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    className={`dropdown-menu-item ${selectedLang === lang ? 'selected' : ''}`}
                    onClick={() => selectLanguage(lang)}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ══════ MAIN CONTENT ══════ */}
      <main className="main-container">
        {/* ── LEFT PANEL ── */}
        <div className="left-panel">
          {/* Chat */}
          <div className="chat-panel">
            <div className="panel-header">
              <div className="panel-header-dot" />
              Hack Advisor
            </div>
            <div className="chat-messages" ref={chatRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  {msg.text.split('\n').map((line, j) => (
                    <span key={j}>
                      {line.includes('`') ? (
                        line.split('`').map((part, k) =>
                          k % 2 === 1 ? <code key={k}>{part}</code> : <span key={k}>{part}</span>
                        )
                      ) : (
                        line
                      )}
                      {j < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="input-panel">
            <div className="panel-header">
              <div className="panel-header-dot" />
              Command Input
            </div>
            <div className="input-area">
              <textarea
                className="code-input"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }}}
                placeholder={selectedLang ? (step < getSteps(selectedLang).length ? getSteps(selectedLang)[step].codeHint : 'Hack complete!') : 'Select a language to begin...'}
                disabled={!selectedLang || accessGranted}
              />
            </div>
            <div className="input-actions">
              <button className="submit-btn" onClick={handleSubmit} disabled={!userInput.trim() || !selectedLang || accessGranted}>
                Execute ⏎
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (Hack Simulation) ── */}
        <div className="right-panel" style={{ position: 'relative' }}>
          <div className="panel-header">
            <div className="panel-header-dot" />
            Hack Simulation
          </div>

          {!selectedLang ? (
            <div className="idle-message">
              <div className="idle-icon">🔐</div>
              <div>Select a language to start the breach</div>
            </div>
          ) : (
            <div className="hack-area">
              {/* Login Window */}
              <div className="hack-window">
                <div className="hack-window-bar">
                  <div className="hack-window-dots">
                    <div className="hack-window-dot red" />
                    <div className="hack-window-dot yellow" />
                    <div className="hack-window-dot green" />
                  </div>
                  <div className="hack-window-title">Target Login</div>
                </div>
                <div className="hack-window-body">
                  <div className="login-field">
                    <label className="login-label">Email</label>
                    <div className="login-value">konopix@corporation.com</div>
                  </div>
                  <div className="login-field">
                    <label className="login-label">Password</label>
                    <div className="login-value password">{passwordDisplay}</div>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-label">
                      <span>Breach Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal */}
              <div className="hack-window">
                <div className="hack-window-bar">
                  <div className="hack-window-dots">
                    <div className="hack-window-dot red" />
                    <div className="hack-window-dot yellow" />
                    <div className="hack-window-dot green" />
                  </div>
                  <div className="hack-window-title">Terminal</div>
                </div>
                <div className="terminal-body" ref={termRef}>
                  {terminalLines.map((line, i) => (
                    <div key={i} className="terminal-line">
                      <span className={
                        line.includes('✓') || line.includes('GRANTED') ? 'success' :
                        line.includes('⚠') || line.includes('FOUND') ? 'info' :
                        line.includes('ERROR') ? 'error' : 'output'
                      }>{line}</span>
                    </div>
                  ))}
                  <span className="terminal-cursor" />
                </div>
              </div>

              {/* Network Monitor */}
              <div className="hack-window">
                <div className="hack-window-bar">
                  <div className="hack-window-dots">
                    <div className="hack-window-dot red" />
                    <div className="hack-window-dot yellow" />
                    <div className="hack-window-dot green" />
                  </div>
                  <div className="hack-window-title">Network Monitor</div>
                </div>
                <div className="hack-window-body">
                  {networkActivity.length === 0 ? (
                    <div className="network-line">
                      <div className="network-dot" /> Monitoring network traffic...
                    </div>
                  ) : (
                    networkActivity.map((line, i) => (
                      <div key={i} className="network-line">
                        <div className={`network-dot ${line.includes('SSH') ? 'warn' : ''}`} />
                        {line}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Scanline overlay */}
          <div className="scanlines" />

          {/* Access Granted overlay */}
          {accessGranted && (
            <div className="access-overlay">
              <div className="access-text">ACCESS GRANTED</div>
              <div className="access-sub">konopix@corporation.com — BREACHED</div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
