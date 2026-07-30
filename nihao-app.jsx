import { useState, useEffect, useRef } from "react";
import {
  Heart, MessageCircle, Settings as SettingsIcon, Home as HomeIcon,
  User, LogOut, Trash2, ChevronRight, Instagram, MessageSquare,
  Sparkles, Send, Camera,
} from "lucide-react";

// ---------------------------------------------------------------------------
// NI HAO — full app shell
// Entry animation -> Login/Sign up -> Home (Feed + Lao Shi entry) -> Settings
// Red & white theme. Everything free: accounts + posts stored via
// window.storage (personal + shared). Lao Shi itself lives in its own
// component (lao-shi-connected.jsx) — the "Enter Lao Shi" button here is
// where that screen would be shown/navigated to in the real app.
// ---------------------------------------------------------------------------

const RED = "#B23A2E";
const RED_DARK = "#8E2E24";
const RED_LIGHT = "#F9E4E0";
const RED_BORDER = "#F3D9D3";
const TEXT = "#4A2620";
const MUTED = "#B08078";
const WHITE = "#FFFFFF";

function Screen({ children }) {
  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: WHITE, fontFamily: "'Poppins','Segoe UI',sans-serif", color: TEXT }}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. ENTRY ANIMATION
// ---------------------------------------------------------------------------
function EntryAnimation({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center gap-4"
      style={{ background: `linear-gradient(160deg, ${RED} 0%, ${RED_DARK} 100%)` }}
    >
      <style>{`
        @keyframes waveHand { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(20deg)} 75%{transform:rotate(-10deg)} }
        @keyframes popIn { 0%{opacity:0; transform:scale(0.7)} 100%{opacity:1; transform:scale(1)} }
        @keyframes fadeUp { 0%{opacity:0; transform:translateY(12px)} 100%{opacity:1; transform:translateY(0)} }
        .wave { display:inline-block; animation: waveHand 1.1s ease-in-out infinite; transform-origin: 70% 70%; }
        .pop { animation: popIn 0.6s cubic-bezier(.34,1.56,.64,1) both; }
        .fade1 { animation: fadeUp 0.6s ease 0.3s both; }
        .fade2 { animation: fadeUp 0.6s ease 0.55s both; }
      `}</style>
      <div className="pop text-7xl">
        <span className="wave">👋</span>
      </div>
      <div className="fade1 text-5xl font-bold text-white tracking-wide">你好</div>
      <div className="fade2 text-2xl font-semibold text-white opacity-90">Ni Hao</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. LOGIN / SIGN UP — username + password only
// ---------------------------------------------------------------------------
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    setError("");
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError("Please fill in both fields.");
      return;
    }
    if (/\s/.test(cleanUsername)) {
      setError("Username can't contain spaces — try something like 'salami123'.");
      return;
    }
    if (cleanUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    setBusy(true);
    try {
      const key = `user:${cleanUsername.toLowerCase()}`;
      let existing = null;
      try {
        existing = await window.storage.get(key, false);
      } catch (e) {
        existing = null; // key doesn't exist yet — expected for new users
      }

      if (mode === "signup") {
        if (existing) {
          setError("That username is already taken.");
          setBusy(false);
          return;
        }
        const profile = { username: cleanUsername, password, displayName: cleanUsername, avatar: null, createdAt: Date.now() };
        await window.storage.set(key, JSON.stringify(profile), false);
        onAuth(profile);
      } else {
        if (!existing) {
          setError("No account found with that username.");
          setBusy(false);
          return;
        }
        const profile = JSON.parse(existing.value);
        if (profile.password !== password) {
          setError("Incorrect password.");
          setBusy(false);
          return;
        }
        onAuth(profile);
      }
    } catch (e) {
      setError(`Something went wrong: ${e?.message || "please try again"}.`);
    }
    setBusy(false);
  }

  return (
    <Screen>
      <div className="flex-1 flex flex-col justify-center px-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">你好</div>
          <h1 className="text-2xl font-bold" style={{ color: RED }}>Ni Hao</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            {mode === "login" ? "Welcome back — log in to continue" : "Create your free account"}
          </p>
        </div>

        <div className="space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: RED_LIGHT, border: `1px solid ${RED_BORDER}` }}
          />
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 pr-16 rounded-xl text-sm outline-none"
              style={{ background: RED_LIGHT, border: `1px solid ${RED_BORDER}` }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
              style={{ color: RED }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {error && <p className="text-xs" style={{ color: RED }}>{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={busy}
            className="w-full py-3 rounded-xl text-sm font-semibold"
            style={{ background: RED, color: WHITE, opacity: busy ? 0.7 : 1 }}
          >
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </div>

        <button
          onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          className="text-xs mt-5 text-center"
          style={{ color: MUTED }}
        >
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// 3. FEED — text posts + likes + Lao Shi entry button
// ---------------------------------------------------------------------------
function FeedScreen({ user, onEnterLaoShi }) {
  const [posts, setPosts] = useState([]);
  const [draft, setDraft] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await window.storage.list("post:", true);
        const items = await Promise.all(
          (list?.keys || []).map(async (k) => {
            const r = await window.storage.get(k, true);
            return r ? JSON.parse(r.value) : null;
          })
        );
        setPosts(items.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  async function submitPost() {
    const text = draft.trim();
    if (!text) return;
    const post = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      author: user.displayName || user.username,
      text,
      likes: 0,
      likedByMe: false,
      createdAt: Date.now(),
    };
    setPosts((p) => [post, ...p]);
    setDraft("");
    try {
      await window.storage.set(`post:${post.id}`, JSON.stringify(post), true);
    } catch (e) {}
  }

  async function toggleLike(post) {
    const updated = { ...post, likes: post.likedByMe ? post.likes - 1 : post.likes + 1, likedByMe: !post.likedByMe };
    setPosts((list) => list.map((p) => (p.id === post.id ? updated : p)));
    try {
      await window.storage.set(`post:${post.id}`, JSON.stringify(updated), true);
    } catch (e) {}
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Lao Shi entry card */}
      <button
        onClick={onEnterLaoShi}
        className="w-full flex items-center gap-3 mx-5 mt-4 mb-2 p-4 rounded-2xl text-left"
        style={{ background: `linear-gradient(135deg, ${RED} 0%, ${RED_DARK} 100%)` }}
      >
        <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.2)" }}>
          <span className="text-xl">先</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">Enter Lao Shi</div>
          <div className="text-xs text-white opacity-80">Your AI Chinese teacher is ready</div>
        </div>
        <ChevronRight size={18} color="white" />
      </button>

      {/* Composer */}
      <div className="mx-5 mt-2 mb-4 p-3.5 rounded-2xl" style={{ background: RED_LIGHT, border: `1px solid ${RED_BORDER}` }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What did you learn today?"
          rows={2}
          className="w-full bg-transparent text-sm outline-none resize-none"
          style={{ color: TEXT }}
        />
        <div className="flex justify-end mt-1">
          <button onClick={submitPost} className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ background: RED, color: WHITE }}>
            Post
          </button>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {loaded && posts.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: MUTED }}>
            No posts yet — be the first to share what you're learning!
          </p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="p-4 rounded-2xl" style={{ background: RED_LIGHT, border: `1px solid ${RED_BORDER}` }}>
            <div className="text-xs font-semibold mb-1" style={{ color: RED }}>@{post.author}</div>
            <p className="text-sm leading-relaxed mb-2">{post.text}</p>
            <button onClick={() => toggleLike(post)} className="flex items-center gap-1 text-xs" style={{ color: post.likedByMe ? RED : MUTED }}>
              <Heart size={14} fill={post.likedByMe ? RED : "none"} /> {post.likes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. SETTINGS — profile, account actions, About Ni Hao
// ---------------------------------------------------------------------------
function SettingsScreen({ user, onUpdateUser, onLogout, onDeleteAccount }) {
  const [view, setView] = useState("main"); // main | profile | about
  const [displayName, setDisplayName] = useState(user.displayName || user.username);
  const [avatar, setAvatar] = useState(user.avatar || null);

  function pickAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    const updated = { ...user, displayName: displayName.trim() || user.username, avatar };
    await onUpdateUser(updated);
    setView("main");
  }

  if (view === "profile") {
    return (
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <button onClick={() => setView("main")} className="text-sm mb-4" style={{ color: RED }}>← Settings</button>
        <h2 className="text-lg font-bold mb-4">Profile</h2>

        <div className="flex flex-col items-center mb-5">
          <label className="relative cursor-pointer">
            <div className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden" style={{ background: RED_LIGHT, border: `2px solid ${RED_BORDER}` }}>
              {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : <User size={36} color={MUTED} />}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: RED }}>
              <Camera size={14} color="white" />
            </div>
            <input type="file" accept="image/*" onChange={pickAvatar} className="hidden" />
          </label>
        </div>

        <label className="text-xs font-semibold" style={{ color: MUTED }}>Display name</label>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none mt-1 mb-4"
          style={{ background: RED_LIGHT, border: `1px solid ${RED_BORDER}` }}
        />

        <button onClick={saveProfile} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: RED, color: WHITE }}>
          Save Changes
        </button>
      </div>
    );
  }

  if (view === "about") {
    return (
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <button onClick={() => setView("main")} className="text-sm mb-4" style={{ color: RED }}>← Settings</button>
        <div className="text-center mb-5">
          <div className="text-3xl mb-1">你好</div>
          <h2 className="text-lg font-bold">About Ni Hao</h2>
        </div>
        <p className="text-sm leading-relaxed mb-5" style={{ color: TEXT }}>
          Ni Hao is an AI application featuring Lao Shi, an AI teacher that teaches you Chinese and all about Chinese culture.
          It is built by <span className="font-semibold">iamsalami Tech Hub</span>.
        </p>

        <div className="space-y-2">
          <a
            href="https://www.instagram.com/iamsalamitechhub?igsh=OWZseDNtczVzNnYx"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3.5 rounded-xl"
            style={{ background: RED_LIGHT, border: `1px solid ${RED_BORDER}` }}
          >
            <Instagram size={18} color={RED} />
            <div className="flex-1 text-sm font-medium">Instagram — @iamsalamitechhub</div>
            <ChevronRight size={16} color={MUTED} />
          </a>

          <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: RED_LIGHT, border: `1px solid ${RED_BORDER}` }}>
            <MessageSquare size={18} color={RED} />
            <div className="flex-1">
              <div className="text-sm font-medium">WhatsApp</div>
              <div className="text-xs" style={{ color: MUTED }}>08112645916</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl" style={{ background: RED_LIGHT, border: `1px solid ${RED_BORDER}` }}>
            <div className="text-sm font-medium mb-1">💛 Support Ni Hao</div>
            <div className="text-xs" style={{ color: MUTED }}>PalmPay — 8112645916</div>
            <div className="text-xs" style={{ color: MUTED }}>Salami Olawale Akeem</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4">
      <h2 className="text-lg font-bold mb-4">Settings</h2>
      <div className="space-y-2">
        <button onClick={() => setView("profile")} className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left" style={{ background: RED_LIGHT }}>
          <User size={18} color={RED} />
          <div className="flex-1 text-sm font-medium">Profile</div>
          <ChevronRight size={16} color={MUTED} />
        </button>
        <button onClick={() => setView("about")} className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left" style={{ background: RED_LIGHT }}>
          <Sparkles size={18} color={RED} />
          <div className="flex-1 text-sm font-medium">About Ni Hao</div>
          <ChevronRight size={16} color={MUTED} />
        </button>
        <button onClick={onLogout} className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left" style={{ background: RED_LIGHT }}>
          <LogOut size={18} color={RED} />
          <div className="flex-1 text-sm font-medium">Log Out</div>
        </button>
        <button onClick={onDeleteAccount} className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left" style={{ background: "#FDEAEA" }}>
          <Trash2 size={18} color="#C0392B" />
          <div className="flex-1 text-sm font-medium" style={{ color: "#C0392B" }}>Delete Account</div>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LAO SHI — redesigned to feel warm, simple, and consistent with the rest
// of the app. No gamification (no counters, no checkmarks) — just a clean
// conversation with your teacher, plus quick-topic starters.
// ---------------------------------------------------------------------------

function speakZh(text) {
  try {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "zh-CN";
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
  } catch (e) {}
}

function getSpeechRecognizer() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const recognizer = new SR();
  recognizer.lang = "en-US";
  recognizer.interimResults = false;
  recognizer.maxAlternatives = 1;
  return recognizer;
}

const QUICK_STARTERS = ["Teach me a greeting", "What are the 4 tones?", "Tell me about a festival", "How do I say thank you?"];
const DAILY_CHAT_LIMIT_SECONDS = 60 * 60;

function LaoShiScreen({ onBack }) {
  const [messages, setMessages] = useState([
    { from: "laoshi", text: "你好！我'm Lao Shi, your Chinese teacher. What's your name? I'll tell you how it sounds in Chinese! 😊" },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [secondsUsedToday, setSecondsUsedToday] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef(null);
  const activeTimerRef = useRef(null);
  const recognizerRef = useRef(null);
  const today = new Date().toISOString().slice(0, 10);
  const remaining = Math.max(0, DAILY_CHAT_LIMIT_SECONDS - secondsUsedToday);
  const limitReached = remaining <= 0;

  useEffect(() => {
    if (!getSpeechRecognizer()) setVoiceSupported(false);
    (async () => {
      try {
        const u = await window.storage.get("laoshi:usage");
        if (u?.value) {
          const parsed = JSON.parse(u.value);
          if (parsed.date === today) setSecondsUsedToday(parsed.seconds || 0);
        }
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.storage.set("laoshi:usage", JSON.stringify({ date: today, seconds: secondsUsedToday })).catch(() => {});
  }, [secondsUsedToday, loaded]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function startTimer() {
    if (activeTimerRef.current) return;
    activeTimerRef.current = setInterval(() => setSecondsUsedToday((s) => Math.min(DAILY_CHAT_LIMIT_SECONDS, s + 1)), 1000);
  }
  function stopTimer() {
    if (activeTimerRef.current) { clearInterval(activeTimerRef.current); activeTimerRef.current = null; }
  }
  useEffect(() => () => stopTimer(), []);

  function toggleListening() {
    if (listening) { recognizerRef.current?.stop(); return; }
    const r = getSpeechRecognizer();
    if (!r) return;
    recognizerRef.current = r;
    r.onstart = () => setListening(true);
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.onresult = (e) => setInput((prev) => (prev ? prev + " " + e.results[0][0].transcript : e.results[0][0].transcript));
    r.start();
  }

  async function sendText(text) {
    if (!text.trim() || sending || limitReached) return;
    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setSending(true);
    startTimer();
    try {
      const res = await fetch("/api/laoshi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (res.ok && data.reply) setMessages((m) => [...m, { from: "laoshi", text: data.reply }]);
      else setMessages((m) => [...m, { from: "laoshi", text: data.error || "Lao Shi is resting right now — try again shortly." }]);
    } catch (e) {
      setMessages((m) => [...m, { from: "laoshi", text: "Couldn't reach the classroom — check your connection." }]);
    } finally {
      setSending(false);
      stopTimer();
    }
  }

  return (
    <Screen>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${RED_BORDER}` }}>
        <button onClick={onBack} className="text-sm" style={{ color: RED }}>←</button>
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${RED} 0%, ${RED_DARK} 100%)` }}>
          <span className="text-lg">先</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold">Lao Shi</div>
          <div className="text-xs" style={{ color: MUTED }}>{limitReached ? "Resting for today" : `${Math.ceil(remaining / 60)} min left today`}</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-1.5 ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
              style={{
                background: m.from === "user" ? RED : RED_LIGHT,
                color: m.from === "user" ? WHITE : TEXT,
                borderBottomRightRadius: m.from === "user" ? 4 : 16,
                borderBottomLeftRadius: m.from === "user" ? 16 : 4,
              }}
            >
              {m.text}
            </div>
            {m.from === "laoshi" && (
              <button onClick={() => speakZh(m.text)} className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: RED_LIGHT }}>
                <span style={{ fontSize: 11 }}>🔊</span>
              </button>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="px-4 py-2.5 rounded-2xl text-sm" style={{ background: RED_LIGHT, color: MUTED }}>Lao Shi is thinking…</div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {QUICK_STARTERS.map((q) => (
              <button key={q} onClick={() => sendText(q)} className="px-3 py-1.5 rounded-full text-xs" style={{ background: RED_LIGHT, color: RED, border: `1px solid ${RED_BORDER}` }}>
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-4" style={{ borderTop: `1px solid ${RED_BORDER}` }}>
        {limitReached ? (
          <p className="text-sm text-center" style={{ color: MUTED }}>Lao Shi is resting for today — come back tomorrow! 加油</p>
        ) : (
          <div className="flex gap-2">
            {voiceSupported && (
              <button
                onClick={toggleListening}
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: listening ? RED : RED_LIGHT }}
              >
                <span style={{ fontSize: 16 }}>{listening ? "⏹" : "🎙"}</span>
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendText(input)}
              placeholder={listening ? "Listening..." : "Message Lao Shi..."}
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
              style={{ background: RED_LIGHT, color: TEXT, border: `1px solid ${RED_BORDER}` }}
            />
            <button onClick={() => sendText(input)} disabled={sending} className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: RED, opacity: sending ? 0.6 : 1 }}>
              <Send size={18} color={WHITE} />
            </button>
          </div>
        )}
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// APP ROOT
// ---------------------------------------------------------------------------
export default function NiHaoApp() {
  const [stage, setStage] = useState("entry"); // entry | auth | app
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("feed"); // feed | settings
  const [laoShiOpen, setLaoShiOpen] = useState(false);

  async function handleLogout() {
    setUser(null);
    setStage("auth");
  }

  async function handleDeleteAccount() {
    if (!confirm("Delete your account permanently? This can't be undone.")) return;
    try {
      await window.storage.delete(`user:${user.username.toLowerCase()}`, false);
    } catch (e) {}
    setUser(null);
    setStage("auth");
  }

  async function handleUpdateUser(updated) {
    setUser(updated);
    try {
      await window.storage.set(`user:${updated.username.toLowerCase()}`, JSON.stringify(updated), false);
    } catch (e) {}
  }

  if (stage === "entry") return <EntryAnimation onDone={() => setStage("auth")} />;
  if (stage === "auth") return <AuthScreen onAuth={(u) => { setUser(u); setStage("app"); }} />;

  if (laoShiOpen) {
    return <LaoShiScreen onBack={() => setLaoShiOpen(false)} />;
  }

  return (
    <Screen>
      <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10" style={{ background: WHITE, borderBottom: `1px solid ${RED_BORDER}` }}>
        <div>
          <h1 className="text-lg font-bold" style={{ color: RED }}>你好 Ni Hao</h1>
          <p className="text-xs" style={{ color: MUTED }}>Welcome, {user.displayName || user.username}</p>
        </div>
        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center" style={{ background: RED_LIGHT }}>
          {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <User size={16} color={RED} />}
        </div>
      </div>

      {tab === "feed" && <FeedScreen user={user} onEnterLaoShi={() => setLaoShiOpen(true)} />}
      {tab === "settings" && (
        <SettingsScreen
          user={user}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {/* Bottom nav */}
      <div className="flex items-center justify-around py-3 sticky bottom-0" style={{ background: WHITE, borderTop: `1px solid ${RED_BORDER}` }}>
        <button onClick={() => setTab("feed")} className="flex flex-col items-center gap-0.5">
          <HomeIcon size={20} color={tab === "feed" ? RED : MUTED} />
          <span className="text-[10px]" style={{ color: tab === "feed" ? RED : MUTED }}>Feed</span>
        </button>
        <button onClick={() => setLaoShiOpen(true)} className="flex flex-col items-center gap-0.5 -mt-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${RED} 0%, ${RED_DARK} 100%)`, boxShadow: "0 4px 14px rgba(178,58,46,0.4)" }}>
            <span className="text-2xl">先</span>
          </div>
        </button>
        <button onClick={() => setTab("settings")} className="flex flex-col items-center gap-0.5">
          <SettingsIcon size={20} color={tab === "settings" ? RED : MUTED} />
          <span className="text-[10px]" style={{ color: tab === "settings" ? RED : MUTED }}>Settings</span>
        </button>
      </div>
    </Screen>
  );
}
