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
    bash: {
      imp: 'apt-get install nmap hydra exploitdb -y',
      init: 'export TARGET="192.168.1.105"',
      scan: 'nmap -sV -p 22,80,443,8080 $TARGET',
      exploit: 'searchsploit openssh 8.2',
      crack: 'hydra -l konopix -P rockyou.txt ssh://$TARGET',
      connect: 'ssh konopix@$TARGET',
    },
    python: {
      imp: 'import nmap, paramiko',
      init: 'target = "192.168.1.105"',
      scan: 'scanner = nmap.PortScanner(); scanner.scan(target, "22,80,443,8080")',
      exploit: 'print(scanner[target].tcp(22)["version"])',
      crack: 'client = paramiko.SSHClient(); client.connect(target, username="konopix", password="Kx#9$mPw2!")',
      connect: 'shell = client.invoke_shell()',
    },
    javascript: {
      imp: 'const nmap = require("node-nmap"); const ssh2 = require("ssh2");',
      init: 'const target = "192.168.1.105";',
      scan: 'const scan = new nmap.NmapScan(target, "-p 22,80,443,8080");',
      exploit: 'scan.on("complete", (data) => console.log(data[0].openPorts));',
      crack: 'const conn = new ssh2.Client(); conn.connect({ host: target, username: "konopix", password: "Kx#9$mPw2!" });',
      connect: 'conn.on("ready", () => conn.shell((err, stream) => {}));',
    },
    sql: {
      imp: '-- SQL Injection Payload Preparation',
      init: 'SET @target_url = "http://192.168.1.105/login.php";',
      scan: 'SELECT @@version, database(), current_user();',
      exploit: 'UNION SELECT 1, table_name, 3 FROM information_schema.tables--',
      crack: 'UNION SELECT username, password FROM users WHERE username="konopix"--',
      connect: 'INSERT INTO users (username, password) VALUES ("admin", "hacked")--',
    }
  };

  const fallback = {
    imp: `import lib_exploit`,
    init: `target = set_target("192.168.1.105")`,
    scan: `scan_ports(target, [22, 80, 443, 8080])`,
    exploit: `check_vuln(target, port=22)`,
    crack: `brute_force(target, "konopix", "rockyou.txt")`,
    connect: `connect_shell(target, "konopix", password)`,
  };

  return map[l] || fallback;
}

function getSteps(lang: string): HackStep[] {
  const s = getSyntax(lang);
  return [
    {
      botMessage: `Excellent choice — ${lang}. Let's prepare our offensive toolset. First, import/install the necessary modules:\n\`${s.imp}\``,
      codeHint: s.imp,
      terminalLines: [
        '> Reading package lists... Done',
        '> Building dependency tree... Done',
        '> Setting up libraries (100%)',
        '> Environment ready. No errors detected. ✓',
      ],
      progressAdd: 5,
      passwordReveal: 0,
    },
    {
      botMessage: `Tools loaded. Now, define our primary target for the operation:\n\`${s.init}\``,
      codeHint: s.init,
      terminalLines: [
        '> Configuring target variables...',
        '> TARGET_IP = 192.168.1.105',
        '> Route to target established. Ping 12ms. ✓',
      ],
      progressAdd: 10,
      passwordReveal: 0,
    },
    {
      botMessage: `We need intelligence. Run a port scan to identify running services and their exact versions:\n\`${s.scan}\``,
      codeHint: s.scan,
      terminalLines: [
        '> Starting Nmap 7.93 ( https://nmap.org ) at 2026-05-31 16:42 CET',
        '> Nmap scan report for 192.168.1.105',
        '> Host is up (0.012s latency).',
        '> PORT     STATE SERVICE  VERSION',
        '> 22/tcp   open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.5',
        '> 80/tcp   open  http     Apache httpd 2.4.41 ((Ubuntu))',
        '> 443/tcp  open  ssl/http Apache httpd 2.4.41',
        '> 8080/tcp open  http-proxy',
        '> Service detection performed. ✓',
      ],
      progressAdd: 20,
      passwordReveal: 2,
    },
    {
      botMessage: `Interesting. OpenSSH 8.2p1 is running on port 22. Let's check our exploit database for known vulnerabilities on this version:\n\`${s.exploit}\``,
      codeHint: s.exploit,
      terminalLines: [
        '> Searching exploit-db...',
        '> ----------------------------------------',
        '> OpenSSH 8.2p1 - User Enumeration (CVE-2020-14145)',
        '> OpenSSH < 8.3p1 - Username Enumeration',
        '> ----------------------------------------',
        '> Vulnerability confirmed. Target allows brute-forcing. ⚠',
      ],
      progressAdd: 20,
      passwordReveal: 3,
    },
    {
      botMessage: `We have a vector. Launch a dictionary attack against the SSH service using the 'rockyou' wordlist:\n\`${s.crack}\``,
      codeHint: s.crack,
      terminalLines: [
        '> Hydra v9.4 (c) 2022 by van Hauser/THC',
        '> [DATA] max 16 tasks per 1 server, overall 16 tasks, 14,341,564 login tries',
        '> [DATA] attacking ssh://192.168.1.105:22/',
        '> [ATTEMPT] target 192.168.1.105 - login "konopix" - pass "summer2024"',
        '> [ATTEMPT] target 192.168.1.105 - login "konopix" - pass "qwerty1234"',
        '> [22][ssh] host: 192.168.1.105   login: konopix   password: Kx#9$mPw2!',
        `> 1 of 1 target successfully completed, 1 valid password found ✓`,
      ],
      progressAdd: 25,
      passwordReveal: TARGET_PASSWORD.length,
    },
    {
      botMessage: `We got the credentials. Initiate the final SSH connection to gain a shell on the target:\n\`${s.connect}\``,
      codeHint: s.connect,
      terminalLines: [
        '> ssh konopix@192.168.1.105',
        '> konopix@192.168.1.105\'s password: **********',
        '> Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.4.0-144-generic x86_64)',
        '> ',
        '>  * Documentation:  https://help.ubuntu.com',
        '>  * Management:     https://landscape.canonical.com',
        '> ',
        '> Last login: Tue May 26 14:32:11 2026 from 10.0.0.42',
        '> konopix@corp-srv-01:~$ _',
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

        <div className="header-actions">
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
