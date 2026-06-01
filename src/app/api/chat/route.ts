import { NextResponse } from 'next/server';
import { selectGame } from '../games';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ============================
// DouTok AI — Smart Chat Backend
// ============================

// Built-in knowledge base for common questions (no internet needed)
// Hardcoded KNOWLEDGE removed in favor of Gemini API

// Casual conversation patterns
const GREETINGS = ['ahoj', 'čau', 'čus', 'zdravím', 'hello', 'hi', 'hej', 'nazdar', 'dobrý den', 'dobré ráno', 'dobrý večer'];
const FAREWELLS = ['nashle', 'čau', 'papa', 'bye', 'zatím', 'sbohem', 'dobrou noc'];
const THANKS = ['díky', 'dekuji', 'děkuji', 'dík', 'díkes', 'thanks', 'děkuju'];
const HOW_ARE_YOU = ['jak se máš', 'jak je', 'co děláš', 'jak to jde', 'co ty'];

function getGreetingByTime(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Dobré ráno';
  if (hour < 18) return 'Dobré odpoledne';
  return 'Dobrý večer';
}

// Search functions removed in favor of Gemini API

  try {
    // Example using Tavily API which is highly reliable for AI
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: 'basic',
        max_results: 5
      })
    });

    if (!res.ok) return { snippets: [], urls: [] };
    const data = await res.json();

    return {
      snippets: data.results.map((r: any) => r.content),
      urls: data.results.map((r: any) => r.url)
    };
  } catch (err) {
    console.error('Nexus Search error:', err);
    return { snippets: [], urls: [] };
  }
}

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }




    const lowerMsg = message.toLowerCase().trim();

    // --- Personalization from conversation history ---
    let userName = '';
    let conversationFlavor = '';
    if (history && Array.isArray(history) && history.length > 2) {
      const pastUserMsgs = history.filter((m: any) => m.role === 'user');
      if (pastUserMsgs.length >= 3) {
        conversationFlavor = ' Rád se s tebou bavím — vidím, že máš spoustu otázek! ';
      } else if (pastUserMsgs.length >= 1) {
        conversationFlavor = ' ';
      }
      // Check if user mentioned their name
      for (const m of pastUserMsgs) {
        const nameMatch = (m.text || '').match(/(?:jsem|říkej mi|moje jméno je|jmenuju se)\s+(\w+)/i);
        if (nameMatch) {
          userName = nameMatch[1];
          break;
        }
      }
    }
    const namePrefix = userName ? `${userName}, ` : '';

    // ============================
    // 1. File upload handling
    // ============================
    if (lowerMsg.startsWith('📎')) {
      const fileName = message.match(/\[Soubor: (.+?)\]/)?.[1] || 'tvůj soubor';
      return NextResponse.json({
        reply: `${namePrefix}Soubor **${fileName}** jsem úspěšně přijal! 📁 Aktuálně ho zatím neumím zpracovat (potřeboval bych napojení na reálný AI model), ale v budoucnu ti ho budu umět analyzovat, shrnout nebo převést.`
      });
    }

    // ============================
    // 2. Presentation request → returns canvas data
    // ============================
    if (lowerMsg.includes('vytvoř mi prezentaci')) {
      const topic = message.replace(/vytvoř mi prezentaci na téma\.*/i, '').trim();
      if (!topic || topic === '...') {
        return NextResponse.json({
          reply: `${namePrefix}Rád ti vytvořím prezentaci! 📊 Na jaké téma? Napiš třeba "Vytvoř mi prezentaci na téma umělá inteligence".`
        });
      }

      const gradients = [
        'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        'linear-gradient(135deg, #141e30, #243b55)',
        'linear-gradient(135deg, #0d1b2a, #1b263b, #415a77)',
        'linear-gradient(135deg, #2d1b69, #11001c)',
        'linear-gradient(135deg, #1c1c1c, #383838)',
        'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      ];

      const slides = [
        {
          title: topic,
          content: '<p style="font-size:1.3rem; opacity: 0.8;">Kompletní přehled a analýza</p><p style="margin-top: 30px; opacity: 0.5; font-size: 0.9rem;">Vytvořeno pomocí DouTok AI</p>',
          bg: gradients[0]
        },
        {
          title: 'Co je ' + topic + '?',
          content: '<ul><li>Základní definice a vysvětlení pojmu</li><li>Zasazení do širšího kontextu</li><li>Proč je toto téma důležité dnes</li><li>Klíčové pojmy k zapamatování</li></ul>',
          bg: gradients[1]
        },
        {
          title: 'Historie a vývoj',
          content: '<ul><li>Jak to celé začalo — první zmínky</li><li>Klíčové milníky ve vývoji</li><li>Významné osobnosti a průkopníci</li><li>Evoluce od počátků do dneška</li></ul>',
          bg: gradients[2]
        },
        {
          title: 'Hlavní principy',
          content: '<ul><li>Základní fungování a mechanismy</li><li>Nejdůležitější koncepty</li><li>Jak to funguje v praxi</li><li>Propojení s jinými oblastmi</li></ul>',
          bg: gradients[3]
        },
        {
          title: 'Praktické využití',
          content: '<ul><li>Příklady z reálného světa</li><li>Využití v průmyslu a byznysu</li><li>Využití v každodenním životě</li><li>Případové studie a úspěchy</li></ul>',
          bg: gradients[4]
        },
        {
          title: 'Výhody a výzvy',
          content: '<ul><li>✅ Hlavní přínosy a výhody</li><li>✅ Pozitivní dopady na společnost</li><li>⚠️ Potenciální rizika a problémy</li><li>⚠️ Etické otázky k zamyšlení</li></ul>',
          bg: gradients[5]
        },
        {
          title: 'Budoucnost a závěr',
          content: '<ul><li>Trendy a predikce na příští roky</li><li>Co nás čeká v blízké budoucnosti</li><li>Shrnutí klíčových bodů prezentace</li><li>Otázky k diskuzi</li></ul><p style="margin-top:24px;opacity:0.6">Děkuji za pozornost! 🎤</p>',
          bg: gradients[6]
        },
      ];

      return NextResponse.json({
        reply: `📊 Připravil jsem ti interaktivní prezentaci na téma **"${topic}"** se 7 slidy. Otevírám Canvas...`,
        canvas: {
          type: 'presentation',
          title: topic,
          slides
        }
      });
    }

    // ============================
    // 3. Game / App request → dynamic game from library
    // ============================
    if (lowerMsg.includes('vytvoř mi') && lowerMsg.includes('hru') || lowerMsg.includes('udělej mi hru') || lowerMsg.includes('zahraj') || lowerMsg.includes('udělej hru')) {
      const game = selectGame(message);
      
      return NextResponse.json({
        reply: `🎮 Připravil jsem ti hru **${game.name}** přímo v Canvasu! Otevírám...`,
        canvas: {
          type: 'app',
          title: game.title,
          appHtml: game.html
        }
      });
    }

    // ============================
    // 4. Game: Guess the number
    // ============================
    if (lowerMsg.includes('hádej číslo') || lowerMsg.includes('hadej cislo')) {
      const secret = Math.floor(Math.random() * 100) + 1;
      return NextResponse.json({
        reply: `Myslím si číslo od **1 do 100** 🎲. Tipni si! (Tajemství: je kolem ${secret > 50 ? 'vyšších' : 'nižších'} čísel 😉)`
      });
    }

    // ============================
    // 5. Greetings
    // ============================
    if (GREETINGS.some(g => lowerMsg.includes(g))) {
      const greeting = getGreetingByTime();
      return NextResponse.json({
        reply: `${greeting}! ${namePrefix ? `Rád tě vidím, ${userName}! ` : ''}Jsem DouTok AI — tvůj osobní asistent. 🤖 Můžu pro tebe vyhledávat informace na webu, vytvořit prezentaci, nebo si prostě popovídat. Co ti mohu nabídnout?`
      });
    }

    // ============================
    // 6. Thanks
    // ============================
    if (THANKS.some(t => lowerMsg.includes(t))) {
      return NextResponse.json({
        reply: `${namePrefix}Nemáš zač! 😊 Jsem tu pro tebe kdykoliv.${conversationFlavor}`
      });
    }

    // ============================
    // 7. Farewell
    // ============================
    if (FAREWELLS.some(f => lowerMsg === f || lowerMsg.startsWith(f))) {
      return NextResponse.json({
        reply: `${namePrefix}Měj se krásně! 👋 Kdykoli budeš potřebovat, stačí napsat.`
      });
    }

    // ============================
    // 8. How are you
    // ============================
    if (HOW_ARE_YOU.some(h => lowerMsg.includes(h))) {
      return NextResponse.json({
        reply: `Mám se výborně, díky za optání! 😄${conversationFlavor}A co ty, ${userName || 'jak je tobě'}?`
      });
    }

    // ============================
    // 9. Joke
    // ============================
    if (lowerMsg.includes('vtip') || lowerMsg.includes('joke') || lowerMsg.includes('funny')) {
      const jokes = [
        'Proč programátoři preferují dark mode? Protože světlo přitahuje brouky (bugs)! 🐛',
        'Co řekl JavaScript Pythonu? „Ty máš třídy? Já mám prototypy!" 😂',
        'Kolik programátorů potřebuješ na výměnu žárovky? Žádného — to je hardwarový problém! 💡',
        'Proč se HTML nemůže dohodnout s CSS? Protože mají problémy se stylem! 🎨',
        'Co je nejoblíbenější hudební žánr programátorů? Al-go-rhythm! 🎵',
      ];
      return NextResponse.json({
        reply: jokes[Math.floor(Math.random() * jokes.length)]
      });
    }

    // ============================
    // 10. Who are you
    // ============================
    if (lowerMsg.includes('kdo jsi') || lowerMsg.includes('co jsi') || lowerMsg.includes('co umíš')) {
      return NextResponse.json({
        reply: `Jsem **DouTok AI** — tvůj osobní chatovací asistent! 🤖\n\nCo všechno umím:\n🔍 **Vyhledávat** informace na internetu přes DuckDuckGo\n📊 **Vytvořit prezentaci** na libovolné téma\n🎮 **Navrhnout hru** nebo kvíz\n📎 **Přijímat soubory** (fotky, dokumenty)\n💬 **Povídat si** a odpovídat na otázky\n\nStačí se zeptat!`
      });
    }

    // ============================
    // 11. Name introduction
    // ============================
    const nameIntro = lowerMsg.match(/(?:jsem|říkej mi|jmenuju se|moje jméno je)\s+(\w+)/i);
    if (nameIntro) {
      const detectedName = nameIntro[1].charAt(0).toUpperCase() + nameIntro[1].slice(1);
      return NextResponse.json({
        reply: `Těší mě, ${detectedName}! 🎉 Budu si tě pamatovat. Jak ti mohu dnes pomoci?`
      });
    }

    // ============================
    // 12. Gemini AI Integration (Replaces Knowledge Base & Search)
    // ============================
    try {
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({
          reply: `${namePrefix}Omlouvám se, ale AI model (Gemini) není nakonfigurován (chybí GEMINI_API_KEY v .env).`
        });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const systemPrompt = `Jsi umělá inteligence v Konopix Hack-In Simulátoru.
Tvé odpovědi musí být VŽDY VELMI STRUČNÉ a K VĚCI. Nekrafej zbytečně dlouho.
Jsi expert na hacking, IT a kybernetickou bezpečnost (pomáháš uživateli v simulátoru).
Zároveň máš obrovský všeobecný přehled (zastupuješ databázi "30 000 otázek") a umíš se bavit i normálně.
Když se s tebou uživatel baví o čemkoliv, odpověz krátce a přátelsky.
Jméno uživatele je: ${userName || 'Neznámý'}.`;

      // We send previous messages to Gemini to maintain context
      const formattedHistory = history && Array.isArray(history) ? history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || '' }]
      })) : [];

      const chatSession = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'Rozumím. Jsem připraven stručně a jasně pomáhat v rámci Konopix Hack-In Simulátoru i běžné konverzace.' }] },
          ...formattedHistory
        ],
      });

      const result = await chatSession.sendMessage(message);
      const aiReply = result.response.text();

      return NextResponse.json({
        reply: aiReply
      });

    } catch (e) {
      console.error('Gemini API Error:', e);
      return NextResponse.json({
        reply: `${namePrefix}Promiň, spojení s mým hlavním mozkem (Gemini) se nezdařilo. Zkus to prosím za chvíli.`
      });
    }
}
