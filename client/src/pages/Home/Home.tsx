import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ─── DATA ────────────────────────────────────────────────────────────────────

const ROLES = [
  { id: "ios",      label: "iOS Developer",    emoji: "📱", desc: "Swift, UIKit, SwiftUI" },
  { id: "swe",      label: "Software Engineer", emoji: "💻", desc: "DSA, System Design" },
  { id: "data",     label: "Data Analyst",      emoji: "📊", desc: "SQL, Python, BI tools" },
  { id: "frontend", label: "Frontend",          emoji: "🎨", desc: "React, CSS, JavaScript" },
  { id: "other",    label: "Other",             emoji: "✦",  desc: "General interviews" },
];

const PRACTICE_TYPES = [
  { id: "technical",  label: "Technical Questions",  desc: "Coding, system design, domain-specific", icon: "⌥" },
  { id: "behavioral", label: "Behavioral / Generic", desc: "HR, leadership, STAR-format questions",  icon: "◎" },
  { id: "both",       label: "Both",                 desc: "Full prep — technical + behavioral",     icon: "⊕", recommended: true },
];

const STATS = [
  { label: "Avg Score",    value: "84%",    delta: "↑ +3% this week",  color: "#6366F1" },
  { label: "Filler Words", value: "2.1",    delta: "↓ improving",      color: "#06B6D4" },
  { label: "Pace",         value: "142wpm", delta: "✓ on target",      color: "#8B5CF6" },
  { label: "Sessions",     value: "7",      delta: "this week",        color: "#10B981" },
];

const RECENT_SESSIONS = [
  { type: "Technical",  score: 88, date: "Today",     duration: "24 min", pct: 88 },
  { type: "Behavioral", score: 79, date: "Yesterday", duration: "18 min", pct: 79 },
  { type: "Mixed",      score: 91, date: "Mar 14",    duration: "35 min", pct: 91 },
];

const ROLE_PACKS = {
  ios:      [{ name: "Swift Fundamentals", q: 42, d: "Medium" }, { name: "UIKit & SwiftUI", q: 38, d: "Hard" }, { name: "iOS System Design", q: 24, d: "Hard" }, { name: "App Architecture", q: 31, d: "Medium" }],
  swe:      [{ name: "LeetCode Patterns",  q: 60, d: "Medium" }, { name: "System Design Core", q: 28, d: "Hard" }, { name: "OOP & Patterns", q: 35, d: "Medium" }, { name: "Behavioral STAR", q: 40, d: "Easy" }],
  data:     [{ name: "SQL Mastery",        q: 50, d: "Medium" }, { name: "Python Analytics", q: 45, d: "Medium" }, { name: "Statistics", q: 30, d: "Hard" }, { name: "BI & Visualization", q: 22, d: "Easy" }],
  frontend: [{ name: "React Deep Dive",   q: 48, d: "Medium" }, { name: "CSS & Layout", q: 35, d: "Medium" }, { name: "JavaScript Core", q: 55, d: "Hard" }, { name: "Web Performance", q: 20, d: "Hard" }],
  other:    [{ name: "General Engineering",q: 40, d: "Medium" }, { name: "Behavioral STAR", q: 40, d: "Easy" }, { name: "Problem Solving", q: 35, d: "Medium" }, { name: "Leadership Stories", q: 25, d: "Easy" }],
};

// ─── SVG ILLUSTRATIONS ───────────────────────────────────────────────────────

// Hero right-side illustration: abstract interview scene
const HeroIllustration = () => (
  <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 420, opacity: 0.92 }}>
    {/* Background glow blobs */}
    <ellipse cx="210" cy="140" rx="180" ry="120" fill="url(#heroGlow)" opacity="0.3" />
    <ellipse cx="340" cy="80" rx="80" ry="60" fill="url(#heroGlow2)" opacity="0.2" />

    {/* Main chat window */}
    <rect x="40" y="30" width="240" height="180" rx="16" fill="white" fillOpacity="0.08" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
    <rect x="40" y="30" width="240" height="40" rx="16" fill="white" fillOpacity="0.06" />
    <rect x="40" y="54" width="240" height="16" fill="white" fillOpacity="0.04" />
    {/* Traffic light dots */}
    <circle cx="62" cy="50" r="5" fill="#FF5F57" fillOpacity="0.8" />
    <circle cx="78" cy="50" r="5" fill="#FEBC2E" fillOpacity="0.8" />
    <circle cx="94" cy="50" r="5" fill="#28C840" fillOpacity="0.8" />
    {/* Top bar label */}
    <rect x="140" y="44" width="80" height="12" rx="6" fill="white" fillOpacity="0.12" />

    {/* AI question bubble */}
    <rect x="56" y="84" width="160" height="44" rx="12" fill="url(#bubbleGrad1)" />
    <text x="72" y="101" fill="white" fillOpacity="0.9" fontSize="9" fontFamily="sans-serif" fontWeight="600">AI Interviewer</text>
    <rect x="72" y="108" width="120" height="7" rx="3.5" fill="white" fillOpacity="0.5" />
    <rect x="72" y="118" width="80" height="7" rx="3.5" fill="white" fillOpacity="0.3" />
    {/* Tail */}
    <path d="M64 128 L56 136 L80 128Z" fill="url(#bubbleGrad1)" />

    {/* User reply bubble */}
    <rect x="100" y="148" width="164" height="36" rx="12" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
    <rect x="116" y="158" width="100" height="7" rx="3.5" fill="white" fillOpacity="0.5" />
    <rect x="116" y="168" width="70" height="7" rx="3.5" fill="white" fillOpacity="0.3" />
    <path d="M256 184 L264 192 L240 184Z" fill="white" fillOpacity="0.12" />

    {/* Score badge */}
    <rect x="220" y="90" width="72" height="72" rx="14" fill="url(#scoreGrad)" />
    <text x="256" y="122" fill="white" fontSize="22" fontWeight="800" fontFamily="sans-serif" textAnchor="middle">88%</text>
    <text x="256" y="138" fill="white" fillOpacity="0.7" fontSize="9" fontFamily="sans-serif" textAnchor="middle">Score</text>
    {/* Score ring */}
    <circle cx="256" cy="118" r="28" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" fill="none" strokeDasharray="4 3" />

    {/* Floating stat chips */}
    <rect x="300" y="150" width="90" height="32" rx="10" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
    <circle cx="316" cy="166" r="7" fill="#10B981" fillOpacity="0.8" />
    <text x="328" y="170" fill="white" fillOpacity="0.9" fontSize="10" fontFamily="sans-serif" fontWeight="700">Pace ✓</text>

    <rect x="300" y="110" width="90" height="32" rx="10" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
    <circle cx="316" cy="126" r="7" fill="#818CF8" fillOpacity="0.9" />
    <text x="328" y="130" fill="white" fillOpacity="0.9" fontSize="10" fontFamily="sans-serif" fontWeight="700">Clarity ↑</text>

    <rect x="308" y="72" width="84" height="32" rx="10" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
    <circle cx="322" cy="88" r="7" fill="#F59E0B" fillOpacity="0.9" />
    <text x="334" y="92" fill="white" fillOpacity="0.9" fontSize="10" fontFamily="sans-serif" fontWeight="700">+3% ↑</text>

    {/* Decorative dots grid */}
    {[0,1,2,3,4].map(col => [0,1,2,3].map(row => (
      <circle key={`${col}-${row}`} cx={330 + col * 14} cy={200 + row * 14} r="1.5" fill="white" fillOpacity="0.15" />
    )))}

    {/* Waveform at bottom */}
    {[0,1,2,3,4,5,6,7,8,9,10,11].map((i) => {
      const heights = [10,18,8,22,14,28,10,20,12,24,8,16];
      const h = heights[i];
      return <rect key={i} x={56 + i * 16} y={222 - h/2} width="8" height={h} rx="4" fill="#818CF8" fillOpacity={0.4 + i * 0.04} />;
    })}
    <text x="56" y="248" fill="white" fillOpacity="0.4" fontSize="9" fontFamily="sans-serif">Voice analysis active...</text>

    <defs>
      <radialGradient id="heroGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="heroGlow2" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="bubbleGrad1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#818CF8" />
      </linearGradient>
      <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.9" />
      </linearGradient>
    </defs>
  </svg>
);

// Technical practice card illustration — general technical concepts (not just coding)
const TechIllustration = () => (
  <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 120, height: 80 }}>
    <rect x="8" y="8" width="104" height="64" rx="10" fill="#EEF2FF" />
    {/* System diagram: 3 boxes connected */}
    <rect x="16" y="20" width="28" height="18" rx="5" fill="#6366F1" fillOpacity="0.2" stroke="#6366F1" strokeOpacity="0.4" strokeWidth="1.2" />
    <text x="22" y="32" fill="#6366F1" fontSize="8" fontFamily="sans-serif" fontWeight="700">API</text>

    <rect x="54" y="14" width="28" height="18" rx="5" fill="#818CF8" fillOpacity="0.2" stroke="#818CF8" strokeOpacity="0.4" strokeWidth="1.2" />
    <text x="57" y="26" fill="#6366F1" fontSize="7" fontFamily="sans-serif" fontWeight="700">Server</text>

    <rect x="54" y="44" width="28" height="18" rx="5" fill="#06B6D4" fillOpacity="0.15" stroke="#06B6D4" strokeOpacity="0.4" strokeWidth="1.2" />
    <text x="60" y="56" fill="#0891B2" fontSize="7" fontFamily="sans-serif" fontWeight="700">DB</text>

    {/* Connector lines */}
    <line x1="44" y1="29" x2="54" y2="23" stroke="#6366F1" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="3 2" />
    <line x1="44" y1="29" x2="54" y2="53" stroke="#06B6D4" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="3 2" />
    <circle cx="44" cy="29" r="3" fill="#6366F1" fillOpacity="0.6" />
    <circle cx="54" cy="23" r="2.5" fill="#818CF8" fillOpacity="0.7" />
    <circle cx="54" cy="53" r="2.5" fill="#06B6D4" fillOpacity="0.7" />

    {/* Right: checklist */}
    <rect x="88" y="18" width="16" height="5" rx="2.5" fill="#A5B4FC" fillOpacity="0.5" />
    <rect x="88" y="27" width="16" height="5" rx="2.5" fill="#A5B4FC" fillOpacity="0.35" />
    <rect x="88" y="36" width="16" height="5" rx="2.5" fill="#A5B4FC" fillOpacity="0.2" />
    <circle cx="85" cy="20.5" r="2.5" fill="#6366F1" fillOpacity="0.5" />
    <circle cx="85" cy="29.5" r="2.5" fill="#10B981" fillOpacity="0.6" />
    <circle cx="85" cy="38.5" r="2.5" fill="#F59E0B" fillOpacity="0.6" />

    {/* Bottom label */}
    <rect x="16" y="54" width="60" height="10" rx="5" fill="#6366F1" fillOpacity="0.08" />
    <rect x="20" y="57" width="40" height="4" rx="2" fill="#6366F1" fillOpacity="0.25" />
  </svg>
);

// Behavioral card illustration
const BehavioralIllustration = () => (
  <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 120, height: 80 }}>
    <rect x="8" y="8" width="104" height="64" rx="10" fill="#F0F9FF" />
    {/* Two speech bubbles — interviewer & candidate */}
    <rect x="16" y="16" width="70" height="22" rx="8" fill="#BAE6FD" />
    <path d="M20 38 L16 44 L30 38Z" fill="#BAE6FD" />
    <rect x="22" y="22" width="50" height="5" rx="2.5" fill="#0EA5E9" fillOpacity="0.5" />
    <rect x="22" y="30" width="35" height="5" rx="2.5" fill="#0EA5E9" fillOpacity="0.3" />

    <rect x="34" y="48" width="70" height="16" rx="8" fill="#DDD6FE" />
    <path d="M100 48 L104 42 L90 48Z" fill="#DDD6FE" />
    <rect x="40" y="52" width="40" height="5" rx="2.5" fill="#7C3AED" fillOpacity="0.4" />
    <rect x="40" y="59" width="28" height="5" rx="2.5" fill="#7C3AED" fillOpacity="0.25" />

    {/* Stars rating */}
    {[0,1,2,3,4].map(i => (
      <text key={i} x={16 + i * 10} y={76} fill={i < 4 ? "#F59E0B" : "#E2E8F0"} fontSize="9">★</text>
    ))}
  </svg>
);

// Mixed interview card illustration
const MixedIllustration = () => (
  <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 120, height: 80 }}>
    <rect x="8" y="8" width="48" height="64" rx="8" fill="#EEF2FF" />
    <rect x="64" y="8" width="48" height="64" rx="8" fill="#F0FDF4" />
    {/* Left: code snippet */}
    <rect x="14" y="18" width="36" height="5" rx="2" fill="#6366F1" fillOpacity="0.4" />
    <rect x="14" y="26" width="28" height="4" rx="2" fill="#6366F1" fillOpacity="0.2" />
    <rect x="14" y="33" width="32" height="4" rx="2" fill="#6366F1" fillOpacity="0.2" />
    <rect x="14" y="40" width="22" height="4" rx="2" fill="#6366F1" fillOpacity="0.2" />
    <rect x="14" y="54" width="36" height="10" rx="5" fill="#6366F1" />
    <rect x="20" y="57" width="24" height="4" rx="2" fill="white" fillOpacity="0.7" />
    {/* Right: chat bubbles */}
    <rect x="68" y="18" width="36" height="12" rx="6" fill="#BBF7D0" />
    <rect x="68" y="34" width="36" height="12" rx="6" fill="#D1FAE5" />
    <rect x="68" y="50" width="36" height="12" rx="6" fill="#6EE7B7" fillOpacity="0.5" />
    {/* Bridge/plus in middle */}
    <rect x="52" y="36" width="16" height="8" rx="4" fill="white" />
    <text x="56" y="43" fill="#6366F1" fontSize="10" fontWeight="700">+</text>
  </svg>
);

// Setup left panel illustration
const SetupIllustration = () => (
  <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: 320, marginTop: 24 }}>
    {/* Laptop body */}
    <rect x="40" y="40" width="240" height="150" rx="14" fill="white" fillOpacity="0.07" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" />
    <rect x="40" y="40" width="240" height="28" rx="14" fill="white" fillOpacity="0.05" />
    {/* Screen divider */}
    <rect x="40" y="66" width="240" height="1.5" fill="white" fillOpacity="0.1" />
    {/* Progress bar header */}
    <rect x="56" y="50" width="60" height="8" rx="4" fill="white" fillOpacity="0.15" />
    <circle cx="252" cy="54" r="6" fill="#10B981" fillOpacity="0.7" />
    <circle cx="267" cy="54" r="6" fill="#F59E0B" fillOpacity="0.5" />
    <circle cx="282" cy="54" r="6" fill="#FF5F57" fillOpacity="0.5" />
    {/* Step cards inside */}
    <rect x="56" y="80" width="68" height="90" rx="10" fill="url(#setupCard1)" />
    <rect x="134" y="80" width="68" height="90" rx="10" fill="url(#setupCard2)" fillOpacity="0.5" />
    <rect x="212" y="80" width="52" height="90" rx="10" fill="white" fillOpacity="0.05" stroke="white" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="3 2" />
    {/* Card 1 content */}
    <circle cx="90" cy="102" r="14" fill="white" fillOpacity="0.15" />
    <text x="84" y="107" fill="white" fillOpacity="0.9" fontSize="14">💻</text>
    <rect x="64" y="122" width="52" height="6" rx="3" fill="white" fillOpacity="0.4" />
    <rect x="68" y="132" width="44" height="5" rx="2.5" fill="white" fillOpacity="0.2" />
    <rect x="62" y="148" width="56" height="14" rx="7" fill="white" fillOpacity="0.2" />
    <rect x="70" y="152" width="40" height="6" rx="3" fill="white" fillOpacity="0.4" />
    {/* Card 2 content */}
    <circle cx="168" cy="102" r="14" fill="white" fillOpacity="0.1" />
    <text x="162" y="107" fill="white" fillOpacity="0.6" fontSize="14">📊</text>
    <rect x="142" y="122" width="52" height="6" rx="3" fill="white" fillOpacity="0.25" />
    <rect x="146" y="132" width="44" height="5" rx="2.5" fill="white" fillOpacity="0.15" />
    {/* Active indicator on card 1 */}
    <rect x="56" y="80" width="68" height="3" rx="1.5" fill="url(#activeBar)" />
    {/* Floating badge */}
    <rect x="200" y="60" width="72" height="26" rx="8" fill="url(#badgeGrad)" />
    <text x="214" y="77" fill="white" fontSize="11" fontWeight="700" fontFamily="sans-serif">Step 1 of 2</text>
    <defs>
      <linearGradient id="setupCard1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366F1" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#818CF8" stopOpacity="0.3" />
      </linearGradient>
      <linearGradient id="setupCard2" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="white" stopOpacity="0.08" />
        <stop offset="100%" stopColor="white" stopOpacity="0.04" />
      </linearGradient>
      <linearGradient id="activeBar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
  </svg>
);

// How it works step illustrations
const HowIllustrations = {
  "STEP 01": () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 56, height: 56 }}>
      <rect width="64" height="64" rx="14" fill="#EEF2FF" />
      <rect x="12" y="18" width="40" height="6" rx="3" fill="#C7D2FE" />
      <rect x="12" y="28" width="28" height="5" rx="2.5" fill="#A5B4FC" fillOpacity="0.6" />
      <rect x="12" y="36" width="34" height="5" rx="2.5" fill="#A5B4FC" fillOpacity="0.4" />
      <circle cx="46" cy="46" r="10" fill="#6366F1" />
      <path d="M42 46 L45 49 L50 43" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "STEP 02": () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 56, height: 56 }}>
      <rect width="64" height="64" rx="14" fill="#F0F9FF" />
      <circle cx="32" cy="28" r="12" fill="#BAE6FD" />
      <circle cx="32" cy="26" r="5" fill="#0EA5E9" fillOpacity="0.7" />
      <path d="M23 34 Q32 44 41 34" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Mic */}
      <rect x="28" y="44" width="8" height="12" rx="4" fill="#6366F1" fillOpacity="0.6" />
      <path d="M23 50 Q23 56 32 56 Q41 56 41 50" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.5" />
    </svg>
  ),
  "STEP 03": () => (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 56, height: 56 }}>
      <rect width="64" height="64" rx="14" fill="#F0FDF4" />
      {/* Bar chart */}
      <rect x="12" y="40" width="10" height="14" rx="3" fill="#A7F3D0" />
      <rect x="26" y="30" width="10" height="24" rx="3" fill="#34D399" />
      <rect x="40" y="20" width="10" height="34" rx="3" fill="#10B981" />
      {/* Trend line */}
      <path d="M17 40 L31 30 L45 20" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 2" />
      <circle cx="45" cy="20" r="4" fill="#059669" />
    </svg>
  ),
};

// Pack card mini illustration based on difficulty
const PackIcon = ({ d }) => {
  const colors = { Hard: ["#FEF2F2","#FCA5A5","#EF4444"], Medium: ["#FFFBEB","#FDE68A","#F59E0B"], Easy: ["#F0FDF4","#BBF7D0","#10B981"] };
  const [bg, mid, fg] = colors[d] || colors.Medium;
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 36, height: 36, flexShrink: 0 }}>
      <rect width="36" height="36" rx="8" fill={bg} />
      <rect x="6" y="10" width="24" height="4" rx="2" fill={mid} />
      <rect x="6" y="17" width="16" height="4" rx="2" fill={mid} />
      <rect x="6" y="24" width="20" height="4" rx="2" fill={fg} fillOpacity="0.5" />
    </svg>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #F1F5F9; color: #0F172A; }

  @keyframes fadeIn  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes float   { 0%,100% { transform:translateY(0);   } 50% { transform:translateY(-16px); } }
  @keyframes pulse   { 0%,100% { opacity:0.6; transform:scale(1);    } 50% { opacity:1; transform:scale(1.04); } }

  .fade-in  { animation: fadeIn  0.45s ease forwards; }
  .slide-up { animation: slideUp 0.5s  ease forwards; }

  /* ─── SETUP ─── */

  .setup-page { display:grid; grid-template-columns:1.15fr 0.85fr; min-height:100vh; }

  .setup-left {
    background: linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #0c1445 100%);
    color: white; padding: 52px 56px;
    display: flex; flex-direction: column; justify-content: center;
    position: relative; overflow: hidden;
  }
  .setup-left::after {
    content:''; position:absolute; bottom:-100px; right:-100px;
    width:300px; height:300px; border-radius:50%;
    background: radial-gradient(circle, rgba(6,182,212,0.18), transparent 70%);
    filter: blur(40px); pointer-events:none;
  }
  .setup-blob {
    position:absolute; border-radius:50%;
    background: radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%);
    filter: blur(50px); pointer-events:none;
  }

  .setup-logo { display:flex; align-items:center; gap:12px; margin-bottom:44px; position:relative; z-index:2; }
  .setup-logo-icon {
    width:46px; height:46px; border-radius:13px;
    background: linear-gradient(135deg,#818CF8,#06B6D4);
    display:flex; align-items:center; justify-content:center;
    font-size:22px; box-shadow:0 8px 24px rgba(99,102,241,0.45);
  }
  .setup-logo-name { font-size:15px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; }
  .setup-logo-sub  { font-size:12px; color:rgba(255,255,255,0.4); }

  .setup-left-content { position:relative; z-index:2; }
  .setup-left h1 {
    font-size:38px; font-weight:800; line-height:1.1; letter-spacing:-1px; margin-bottom:14px;
    font-family:'Plus Jakarta Sans',sans-serif;
    background: linear-gradient(135deg, #fff 30%, rgba(165,180,252,0.9) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .setup-left p { font-size:15px; line-height:1.8; color:rgba(255,255,255,0.5); max-width:340px; }

  .setup-right {
    background: white; padding: 0 56px;
    display:flex; flex-direction:column; justify-content:center; overflow-y:auto;
  }
  .setup-right-inner { max-width: 420px; margin: 0 auto; width: 100%; }

  .setup-badge {
    display:flex; align-items:center; gap:10px; margin-bottom:22px;
  }
  .setup-badge-icon {
    width:40px; height:40px; border-radius:11px; flex-shrink:0;
    background: linear-gradient(135deg,#818CF8,#06B6D4);
    box-shadow:0 5px 16px rgba(99,102,241,0.25);
  }
  .setup-badge-title { font-size:14px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; color:#0F172A; }
  .setup-badge-sub   { font-size:12px; color:#94A3B8; margin-top:1px; }

  .step-dots { display:flex; gap:6px; margin-bottom:24px; }
  .step-dot  { height:4px; border-radius:2px; background:#E2E8F0; width:30px; transition:all 0.3s; }
  .step-dot.active { background:#6366F1; width:46px; }
  .step-dot.done   { background:#A5B4FC; }

  .setup-title { font-size:26px; font-weight:800; color:#0F172A; font-family:'Plus Jakarta Sans',sans-serif; margin-bottom:4px; }
  .setup-sub   { font-size:14px; color:#94A3B8; margin-bottom:24px; }

  /* Role cards */
  .role-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:22px; }

  .role-card {
    border:1.5px solid #E2E8F0; border-radius:14px; padding:16px;
    cursor:pointer; transition:all 0.18s; background:#FAFBFD; position:relative;
  }
  .role-card:hover    { border-color:#A5B4FC; background:#F5F3FF; transform:translateY(-1px); box-shadow:0 4px 14px rgba(99,102,241,0.1); }
  .role-card.selected { border-color:#6366F1; background:#F5F3FF; box-shadow:0 0 0 3px rgba(99,102,241,0.12); }
  .role-card.selected::after { content:'✓'; position:absolute; top:10px; right:12px; color:#6366F1; font-size:13px; font-weight:700; }

  .role-emoji { font-size:24px; margin-bottom:8px; display:block; }
  .role-name  { font-size:14px; font-weight:700; color:#0F172A; font-family:'Plus Jakarta Sans',sans-serif; margin-bottom:3px; }
  .role-desc  { font-size:11px; color:#94A3B8; }

  /* Practice cards */
  .practice-list { display:flex; flex-direction:column; gap:10px; margin-bottom:22px; }

  .practice-card {
    border:1.5px solid #E2E8F0; border-radius:14px; padding:15px 18px;
    cursor:pointer; transition:all 0.18s;
    display:flex; align-items:center; gap:14px;
    background:#FAFBFD; position:relative;
  }
  .practice-card:hover    { border-color:#A5B4FC; background:#F5F3FF; transform:translateY(-1px); }
  .practice-card.selected { border-color:#6366F1; background:#F5F3FF; box-shadow:0 0 0 3px rgba(99,102,241,0.12); }
  .practice-card.selected::after { content:'✓'; position:absolute; right:16px; color:#6366F1; font-weight:700; }

  .practice-icon-wrap {
    width:38px; height:38px; border-radius:10px;
    background:#EEF2FF; display:flex; align-items:center; justify-content:center;
    font-size:18px; flex-shrink:0; color:#6366F1;
  }
  .practice-name { font-size:14px; font-weight:700; color:#0F172A; font-family:'Plus Jakarta Sans',sans-serif; margin-bottom:3px; }
  .practice-desc { font-size:12px; color:#94A3B8; }
  .badge-rec { font-size:10px; font-weight:700; background:#EEF2FF; color:#6366F1; border:1px solid #C7D2FE; border-radius:4px; padding:2px 6px; margin-left:8px; }

  /* Buttons */
  .btn-primary {
    width:100%; padding:14px; border-radius:12px; border:none;
    background: linear-gradient(135deg,#1e1b4b,#4F46E5);
    color:white; font-size:15px; font-weight:700;
    font-family:'Plus Jakarta Sans',sans-serif;
    cursor:pointer; transition:all 0.2s;
    box-shadow:0 8px 24px rgba(79,70,229,0.28);
  }
  .btn-primary:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); box-shadow:0 10px 30px rgba(79,70,229,0.35); }
  .btn-primary:disabled { background:#F1F5F9; color:#94A3B8; box-shadow:none; cursor:not-allowed; }

  .btn-ghost {
    padding:12px 20px; border-radius:12px;
    border:1.5px solid #E2E8F0; background:white;
    color:#475569; font-size:14px; font-weight:600;
    font-family:'Plus Jakarta Sans',sans-serif;
    cursor:pointer; transition:all 0.2s;
  }
  .btn-ghost:hover { border-color:#A5B4FC; color:#6366F1; background:#F5F3FF; }

  .btn-row { display:flex; gap:10px; }
  .btn-row .btn-ghost   { flex:1; }
  .btn-row .btn-primary { flex:2; }

  /* ─── NAVBAR ─── */

  .navbar {
    height:62px; background:white;
    border-bottom:1px solid #E2E8F0;
    display:flex; align-items:center; justify-content:space-between;
    padding:0 48px; position:sticky; top:0; z-index:100;
    box-shadow:0 1px 6px rgba(0,0,0,0.05);
  }
  .nav-left  { display:flex; align-items:center; gap:14px; }
  .nav-logo  { display:flex; align-items:center; gap:8px; text-decoration:none; cursor:pointer; }
  .nav-logo-icon {
    width:32px; height:32px; border-radius:9px;
    background:linear-gradient(135deg,#818CF8,#06B6D4);
    display:flex; align-items:center; justify-content:center; font-size:16px;
  }
  .nav-logo-text { font-size:15px; font-weight:700; font-family:'Plus Jakarta Sans',sans-serif; color:#0F172A; }

  .role-pill {
    display:flex; align-items:center; gap:7px;
    background:#F8FAFC; border:1.5px solid #E2E8F0;
    border-radius:8px; padding:6px 12px;
    font-size:13px; font-weight:600; color:#475569;
    cursor:pointer; transition:all 0.18s;
    font-family:'Plus Jakarta Sans',sans-serif;
  }
  .role-pill:hover  { border-color:#A5B4FC; color:#6366F1; background:#F5F3FF; }
  .role-pill-dot    { width:7px; height:7px; border-radius:50%; background:#6366F1; box-shadow:0 0 0 2px rgba(99,102,241,0.2); }

  .nav-right { display:flex; align-items:center; gap:2px; }
  .nav-link  {
    padding:7px 14px; border-radius:8px; border:none; background:none;
    font-size:13px; font-weight:600; color:#64748B;
    cursor:pointer; transition:all 0.18s; font-family:'Plus Jakarta Sans',sans-serif;
  }
  .nav-link:hover { color:#0F172A; background:#F1F5F9; }
  .nav-avatar {
    width:32px; height:32px; border-radius:50%; margin-left:6px;
    background:linear-gradient(135deg,#818CF8,#06B6D4);
    display:flex; align-items:center; justify-content:center;
    font-size:12px; font-weight:700; color:white; cursor:pointer;
    font-family:'Plus Jakarta Sans',sans-serif;
  }

  /* ─── DASHBOARD ─── */

  .dashboard { width:100%; padding:36px 48px 80px; }

  /* Hero */
  .hero {
    background:linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1445 100%);
    border-radius:22px; padding:52px 56px;
    margin-bottom:32px; color:white;
    position:relative; overflow:hidden;
    display:flex; align-items:center; justify-content:space-between; gap:32px;
    min-height:240px;
  }
  .hero-blob1 {
    position:absolute; top:-80px; left:-80px; width:350px; height:350px; border-radius:50%;
    background:radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%);
    filter:blur(50px); pointer-events:none;
  }
  .hero-blob2 {
    position:absolute; bottom:-60px; right:200px; width:250px; height:250px; border-radius:50%;
    background:radial-gradient(circle, rgba(6,182,212,0.15), transparent 70%);
    filter:blur(40px); pointer-events:none;
  }
  .hero-dots {
    position:absolute; top:0; right:0; bottom:0; left:0;
    background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
    background-size: 28px 28px; pointer-events:none;
  }
  .hero-content { position:relative; z-index:2; flex:1; }
  .hero-visual  { position:relative; z-index:2; flex-shrink:0; width:420px; }

  .hero-badge {
    display:inline-flex; align-items:center; gap:7px;
    padding:5px 14px; border-radius:20px;
    background:rgba(99,102,241,0.2); border:1px solid rgba(129,140,248,0.35);
    font-size:11px; font-weight:700; color:#A5B4FC;
    letter-spacing:0.1em; text-transform:uppercase;
    font-family:'Plus Jakarta Sans',sans-serif; margin-bottom:18px;
  }
  .hero-badge-dot { width:6px; height:6px; border-radius:50%; background:#818CF8; animation:pulse 2s ease-in-out infinite; }
  .hero-title {
    font-size:40px; font-weight:800; line-height:1.08;
    font-family:'Plus Jakarta Sans',sans-serif; margin-bottom:12px;
    background:linear-gradient(135deg, #fff 30%, rgba(165,180,252,0.9) 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .hero-sub { font-size:15px; color:rgba(255,255,255,0.5); margin-bottom:32px; }
  .hero-actions { display:flex; gap:14px; flex-wrap:wrap; }

  .btn-hero-primary {
    padding:13px 28px; border-radius:12px; border:none;
    background:linear-gradient(135deg,#818CF8,#6366F1);
    color:white; font-size:14px; font-weight:700;
    font-family:'Plus Jakarta Sans',sans-serif;
    cursor:pointer; transition:all 0.2s;
    box-shadow:0 6px 20px rgba(99,102,241,0.45);
  }
  .btn-hero-primary:hover { opacity:0.9; transform:translateY(-1px); box-shadow:0 10px 28px rgba(99,102,241,0.5); }

  .btn-hero-ghost {
    padding:13px 28px; border-radius:12px;
    border:1.5px solid rgba(255,255,255,0.18);
    background:rgba(255,255,255,0.07);
    color:rgba(255,255,255,0.85);
    font-size:14px; font-weight:600;
    font-family:'Plus Jakarta Sans',sans-serif;
    cursor:pointer; transition:all 0.2s;
  }
  .btn-hero-ghost:hover { background:rgba(255,255,255,0.13); border-color:rgba(255,255,255,0.32); }

  /* Section label */
  .section-header { display:flex; align-items:baseline; gap:10px; margin-bottom:16px; }
  .section-label  { font-size:12px; font-weight:700; letter-spacing:0.9px; text-transform:uppercase; color:#94A3B8; font-family:'Plus Jakarta Sans',sans-serif; }
  .section-count  { font-size:11px; font-weight:600; color:#C7D2FE; background:#EEF2FF; padding:2px 8px; border-radius:10px; }

  /* Quick practice cards */
  .quick-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; margin-bottom:32px; }

  .quick-card {
    background:white; border:1.5px solid #E2E8F0; border-radius:18px;
    padding:24px; transition:all 0.2s; position:relative; overflow:hidden;
  }
  .quick-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:linear-gradient(90deg,#6366F1,#818CF8);
    opacity:0; transition:opacity 0.2s;
  }
  .quick-card:hover { border-color:#A5B4FC; box-shadow:0 8px 28px rgba(99,102,241,0.1); transform:translateY(-2px); }
  .quick-card:hover::before { opacity:1; }

  .qc-illustration { margin-bottom:14px; }
  .qc-name { font-size:16px; font-weight:700; color:#0F172A; font-family:'Plus Jakarta Sans',sans-serif; margin-bottom:6px; }
  .qc-desc { font-size:13px; color:#94A3B8; margin-bottom:20px; line-height:1.55; }

  .btn-start {
    padding:9px 20px; border-radius:9px;
    border:1.5px solid #E2E8F0; background:white;
    color:#475569; font-size:13px; font-weight:600;
    font-family:'Plus Jakarta Sans',sans-serif;
    cursor:pointer; transition:all 0.18s; display:inline-flex; align-items:center; gap:6px;
  }
  .btn-start:hover { background:linear-gradient(135deg,#1e1b4b,#4F46E5); color:white; border-color:transparent; box-shadow:0 4px 14px rgba(79,70,229,0.3); }

  /* Stats */
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }

  .stat-card {
    background:white; border:1.5px solid #E2E8F0; border-radius:16px;
    padding:22px 20px; position:relative; overflow:hidden; transition:all 0.18s;
  }
  .stat-card:hover { box-shadow:0 6px 20px rgba(0,0,0,0.06); transform:translateY(-1px); }
  .stat-card-accent {
    position:absolute; top:0; right:0; width:80px; height:80px; border-radius:50%;
    opacity:0.08; transform:translate(30px,-30px);
  }
  .stat-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.09em; color:#94A3B8; margin-bottom:10px; font-family:'Plus Jakarta Sans',sans-serif; }
  .stat-value { font-size:30px; font-weight:800; color:#0F172A; font-family:'Plus Jakarta Sans',sans-serif; margin-bottom:5px; line-height:1; }
  .stat-delta { font-size:12px; font-weight:600; }

  /* Resume banner */
  .resume-banner {
    background:linear-gradient(135deg,#EEF2FF,#E0F2FE);
    border:1.5px solid #C7D2FE; border-radius:16px;
    padding:20px 24px;
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:28px; cursor:pointer; transition:all 0.18s;
  }
  .resume-banner:hover { border-color:#6366F1; box-shadow:0 6px 24px rgba(99,102,241,0.12); transform:translateY(-1px); }
  .resume-left  { display:flex; align-items:center; gap:16px; }
  .resume-icon-wrap {
    width:46px; height:46px; border-radius:13px; flex-shrink:0;
    background:linear-gradient(135deg,#818CF8,#6366F1);
    display:flex; align-items:center; justify-content:center;
    font-size:20px; box-shadow:0 4px 14px rgba(99,102,241,0.35);
  }
  .resume-title { font-size:15px; font-weight:700; color:#0F172A; font-family:'Plus Jakarta Sans',sans-serif; margin-bottom:3px; }
  .resume-meta  { font-size:13px; color:#64748B; }
  .resume-right { display:flex; align-items:center; gap:12px; }
  .resume-progress { width:100px; height:6px; background:#C7D2FE; border-radius:3px; overflow:hidden; }
  .resume-progress-fill { height:100%; width:62%; background:linear-gradient(90deg,#6366F1,#818CF8); border-radius:3px; }
  .resume-pct { font-size:12px; font-weight:700; color:#6366F1; font-family:'Plus Jakarta Sans',sans-serif; }
  .resume-arrow { color:#6366F1; font-size:22px; font-weight:700; margin-left:8px; }

  /* Role packs */
  .packs-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }

  .pack-card {
    background:white; border:1.5px solid #E2E8F0; border-radius:14px;
    padding:16px 18px;
    display:flex; align-items:center; gap:14px;
    cursor:pointer; transition:all 0.18s;
  }
  .pack-card:hover { border-color:#A5B4FC; background:#FAFBFF; transform:translateY(-1px); box-shadow:0 4px 14px rgba(99,102,241,0.08); }
  .pack-info  { flex:1; min-width:0; }
  .pack-name  { font-size:14px; font-weight:700; color:#0F172A; font-family:'Plus Jakarta Sans',sans-serif; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .pack-q     { font-size:12px; color:#94A3B8; }

  .diff-badge { font-size:11px; font-weight:600; padding:3px 9px; border-radius:6px; flex-shrink:0; }
  .diff-hard   { background:#FEF2F2; color:#EF4444; }
  .diff-medium { background:#FFFBEB; color:#F59E0B; }
  .diff-easy   { background:#F0FDF4; color:#10B981; }

  /* Recent sessions */
  .sessions-list { display:flex; flex-direction:column; gap:12px; margin-bottom:28px; }

  .session-row {
    background:white; border:1.5px solid #E2E8F0; border-radius:14px;
    padding:16px 20px;
    display:flex; align-items:center; justify-content:space-between;
    cursor:pointer; transition:all 0.18s;
  }
  .session-row:hover { border-color:#A5B4FC; background:#FAFBFF; transform:translateY(-1px); box-shadow:0 4px 14px rgba(99,102,241,0.07); }
  .session-left  { display:flex; align-items:center; gap:14px; }
  .session-icon  { width:40px; height:40px; border-radius:11px; background:#EEF2FF; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .session-badge { font-size:11px; font-weight:600; padding:3px 9px; border-radius:6px; background:#F1F5F9; color:#64748B; border:1px solid #E2E8F0; }
  .session-name  { font-size:14px; font-weight:700; color:#0F172A; font-family:'Plus Jakarta Sans',sans-serif; }
  .session-date  { font-size:12px; color:#94A3B8; margin-top:2px; }
  .session-right { display:flex; align-items:center; gap:16px; }
  .session-bar-wrap { width:80px; }
  .session-bar-bg   { height:5px; background:#F1F5F9; border-radius:3px; overflow:hidden; }
  .session-bar-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,#6366F1,#818CF8); }
  .session-score { font-size:22px; font-weight:800; color:#10B981; font-family:'Plus Jakarta Sans',sans-serif; min-width:52px; text-align:right; }

  /* How it works */
  .how-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }

  .how-card {
    background:white; border:1.5px solid #E2E8F0; border-radius:18px;
    padding:24px; transition:all 0.2s; position:relative; overflow:hidden;
  }
  .how-card:hover { border-color:#A5B4FC; transform:translateY(-2px); box-shadow:0 8px 28px rgba(99,102,241,0.09); }
  .how-card-num {
    position:absolute; top:20px; right:20px;
    font-size:42px; font-weight:800; font-family:'Plus Jakarta Sans',sans-serif;
    color:#6366F1; opacity:0.06; line-height:1;
  }
  .how-step { font-size:11px; font-weight:700; color:#6366F1; letter-spacing:1px; font-family:'Plus Jakarta Sans',sans-serif; margin-bottom:12px; }
  .how-title { font-size:16px; font-weight:700; color:#0F172A; font-family:'Plus Jakarta Sans',sans-serif; margin-top:14px; margin-bottom:6px; }
  .how-desc  { font-size:13px; color:#64748B; line-height:1.65; }

  /* Modal */
  .modal-overlay {
    position:fixed; inset:0; background:rgba(15,23,42,0.5);
    backdrop-filter:blur(6px); z-index:200;
    display:flex; align-items:center; justify-content:center;
  }
  .modal-box {
    background:white; border-radius:22px; padding:38px;
    width:90%; max-width:510px;
    box-shadow:0 28px 80px rgba(0,0,0,0.18);
    position:relative; max-height:92vh; overflow-y:auto;
  }
  .modal-close {
    position:absolute; top:14px; right:16px;
    background:#F1F5F9; border:none; border-radius:8px;
    padding:6px 11px; font-size:13px; color:#64748B;
    cursor:pointer; transition:all 0.18s;
    font-family:'Plus Jakarta Sans',sans-serif; font-weight:600;
  }
  .modal-close:hover { background:#E2E8F0; color:#0F172A; }
  .modal-title { font-size:22px; font-weight:800; color:#0F172A; font-family:'Plus Jakarta Sans',sans-serif; margin-bottom:4px; }
  .modal-sub   { font-size:14px; color:#94A3B8; margin-bottom:24px; }
  .modal-step-nav { display:flex; align-items:center; gap:8px; margin-bottom:18px; }
  .modal-step-btn {
    font-size:12px; font-weight:700; padding:5px 13px;
    border-radius:7px; border:1.5px solid #E2E8F0;
    background:#F8FAFC; color:#94A3B8;
    cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif; transition:all 0.18s;
  }
  .modal-step-btn.active { border-color:#6366F1; background:#EEF2FF; color:#6366F1; }
  .modal-sep { color:#CBD5E1; }

  @media (max-width:1100px) {
    .hero-visual { display:none; }
    .packs-grid  { grid-template-columns:repeat(2,1fr); }
  }
  @media (max-width:900px) {
    .setup-page { grid-template-columns:1fr; }
    .setup-left  { display:none; }
    .stats-grid  { grid-template-columns:1fr 1fr; }
  }
  @media (max-width:680px) {
    .quick-grid { grid-template-columns:1fr; }
    .how-grid   { grid-template-columns:1fr; }
    .packs-grid { grid-template-columns:1fr; }
    .role-grid  { grid-template-columns:1fr; }
    .dashboard  { padding:24px 18px 60px; }
    .navbar     { padding:0 18px; }
    .hero       { padding:32px 24px; }
    .hero-title { font-size:28px; }
  }
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();

  const [setupDone,        setSetupDone]        = useState(false);
  const [step,             setStep]             = useState(1);
  const [selectedRole,     setSelectedRole]     = useState(null);
  const [selectedPractice, setSelectedPractice] = useState(null);

  const [showModal,    setShowModal]    = useState(false);
  const [modalStep,    setModalStep]    = useState(1);
  const [tempRole,     setTempRole]     = useState(null);
  const [tempPractice, setTempPractice] = useState(null);

  function handleContinue() {
    if (step === 1 && selectedRole)     { setStep(2); return; }
    if (step === 2 && selectedPractice) { setSetupDone(true); return; }
  }

  function openModal() {
    setTempRole(selectedRole);
    setTempPractice(selectedPractice);
    setModalStep(1);
    setShowModal(true);
  }

  function saveModal() {
    if (tempRole)     setSelectedRole(tempRole);
    if (tempPractice) setSelectedPractice(tempPractice);
    setShowModal(false);
  }

  const role   = ROLES.find(r => r.id === selectedRole);
  const packs  = ROLE_PACKS[selectedRole] || ROLE_PACKS.other;

  const practiceSubtitle =
    selectedPractice === "technical"  ? "Technical sessions ready for you" :
    selectedPractice === "behavioral" ? "Behavioral sessions ready for you" :
    "Technical + Behavioral sessions ready";

  // ── SETUP ─────────────────────────────────────────────────────────────────
  if (!setupDone) {
    return (
      <>
        <style>{css}</style>
        <div className="setup-page">

          {/* Left panel */}
          <div className="setup-left">
            <div className="setup-blob" style={{ top:-80, left:-80, width:360, height:360 }} />
            <div className="setup-left-logo">
              <div className="setup-logo-icon">⚡</div>
              <div>
                <div className="setup-logo-name">InterviewAI</div>
                <div className="setup-logo-sub">Practice platform</div>
              </div>
            </div>
            <div className="setup-left-content">
              <h1>Almost there.<br />Let's personalise<br />your prep.</h1>
              <p>Tell us your role and what you'd like to focus on — we'll tailor every session, question pack, and insight just for you.</p>
              <SetupIllustration />
            </div>
          </div>

          {/* Right panel */}
          <div className="setup-right fade-in">
            <div className="setup-right-inner">

              <div className="setup-badge">
                <div className="setup-badge-icon" />
                <div>
                  <div className="setup-badge-title">Interview Simulation</div>
                  <div className="setup-badge-sub">One-time setup · takes 30 seconds</div>
                </div>
              </div>

              <div className="step-dots">
                <div className={`step-dot ${step === 1 ? "active" : "done"}`} />
                <div className={`step-dot ${step === 2 ? "active" : ""}`} />
              </div>

              {step === 1 && (
                <>
                  <div className="setup-title">What's your role?</div>
                  <p className="setup-sub">We'll personalise your interview prep based on this.</p>
                  <div className="role-grid">
                    {ROLES.map(r => (
                      <div key={r.id} className={`role-card ${selectedRole === r.id ? "selected" : ""}`} onClick={() => setSelectedRole(r.id)}>
                        <span className="role-emoji">{r.emoji}</span>
                        <div className="role-name">{r.label}</div>
                        <div className="role-desc">{r.desc}</div>
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" disabled={!selectedRole} onClick={handleContinue}>Next →</button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="setup-title">Practice focus</div>
                  <p className="setup-sub">What kind of questions would you like to tackle?</p>
                  <div className="practice-list">
                    {PRACTICE_TYPES.map(p => (
                      <div key={p.id} className={`practice-card ${selectedPractice === p.id ? "selected" : ""}`} onClick={() => setSelectedPractice(p.id)}>
                        <div className="practice-icon-wrap">{p.icon}</div>
                        <div>
                          <div className="practice-name">
                            {p.label}
                            {p.recommended && <span className="badge-rec">RECOMMENDED</span>}
                          </div>
                          <div className="practice-desc">{p.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="btn-row">
                    <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
                    <button className="btn-primary" disabled={!selectedPractice} onClick={handleContinue}>Go to Dashboard →</button>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="nav-logo">
            <div className="nav-logo-icon">⚡</div>
            <span className="nav-logo-text">InterviewAI</span>
          </div>
          <button className="role-pill" onClick={openModal}>
            <div className="role-pill-dot" />
            {role?.label} ⌄
          </button>
        </div>
        <div className="nav-right">
          <button className="nav-link">History</button>
          <button className="nav-link">Insights</button>
          <button className="nav-link">Profile</button>
          <div className="nav-avatar">JD</div>
        </div>
      </nav>

      <div className="dashboard fade-in">

        {/* ── Hero ── */}
        <div className="hero">
          <div className="hero-blob1" />
          <div className="hero-blob2" />
          <div className="hero-dots" />

          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-badge-dot" /> Personalised for you
            </div>
            <div className="hero-title">Practice for {role?.label}<br />Interviews</div>
            <div className="hero-sub">{practiceSubtitle}</div>
            <div className="hero-actions">
              <button className="btn-hero-primary">▶ Start Interview</button>
              <button className="btn-hero-ghost" onClick={openModal}>Change Role</button>
            </div>
          </div>

          <div className="hero-visual">
            <HeroIllustration />
          </div>
        </div>

        {/* ── Quick Practice ── */}
        <div className="section-header">
          <div className="section-label">Quick Practice</div>
        </div>
        <div className="quick-grid">
          {(selectedPractice === "technical" || selectedPractice === "both") && (
            <div className="quick-card">
              <div className="qc-illustration"><TechIllustration /></div>
              <div className="qc-name">Technical Practice</div>
              <div className="qc-desc">Domain-specific concepts, tools & problem solving for {role?.label}</div>
              <button className="btn-start">Start →</button>
            </div>
          )}
          {(selectedPractice === "behavioral" || selectedPractice === "both") && (
            <div className="quick-card">
              <div className="qc-illustration"><BehavioralIllustration /></div>
              <div className="qc-name">Behavioral Practice</div>
              <div className="qc-desc">HR / experience / STAR format questions</div>
              <button className="btn-start">Start →</button>
            </div>
          )}
          {selectedPractice === "both" && (
            <div className="quick-card">
              <div className="qc-illustration"><MixedIllustration /></div>
              <div className="qc-name">Mixed Interview</div>
              <div className="qc-desc">Full session — technical + behavioral combined</div>
              <button className="btn-start">Start →</button>
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="section-header">
          <div className="section-label">Your Performance</div>
        </div>
        <div className="stats-grid">
          {STATS.map(s => (
            <div className="stat-card" key={s.label}>
              <div className="stat-card-accent" style={{ background: s.color }} />
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-delta" style={{ color: s.color }}>{s.delta}</div>
            </div>
          ))}
        </div>

        {/* ── Resume banner ── */}
        <div className="resume-banner">
          <div className="resume-left">
            <div className="resume-icon-wrap">▶</div>
            <div>
              <div className="resume-title">Resume last session</div>
              <div className="resume-meta">iOS Technical · 8 of 13 questions · 24 min elapsed</div>
            </div>
          </div>
          <div className="resume-right">
            <div>
              <div className="resume-progress">
                <div className="resume-progress-fill" />
              </div>
            </div>
            <div className="resume-pct">62%</div>
            <div className="resume-arrow">→</div>
          </div>
        </div>

        {/* ── Role Packs ── */}
        <div className="section-header">
          <div className="section-label">{role?.label} Question Packs</div>
          <div className="section-count">{packs.length} packs</div>
        </div>
        <div className="packs-grid">
          {packs.map(p => (
            <div className="pack-card" key={p.name}>
              <PackIcon d={p.d} />
              <div className="pack-info">
                <div className="pack-name">{p.name}</div>
                <div className="pack-q">{p.q} questions</div>
              </div>
              <div className={`diff-badge diff-${p.d.toLowerCase()}`}>{p.d}</div>
            </div>
          ))}
        </div>

        {/* ── Recent Sessions ── */}
        <div className="section-header">
          <div className="section-label">Recent Sessions</div>
        </div>
        <div className="sessions-list">
          {RECENT_SESSIONS.map((s, i) => (
            <div className="session-row" key={i}>
              <div className="session-left">
                <div className="session-icon">
                  {s.type === "Technical" ? "⌥" : s.type === "Behavioral" ? "◎" : "⊕"}
                </div>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <div className="session-name">{role?.label}</div>
                    <div className="session-badge">{s.type}</div>
                  </div>
                  <div className="session-date">{s.date} · {s.duration}</div>
                </div>
              </div>
              <div className="session-right">
                <div className="session-bar-wrap">
                  <div style={{ fontSize:10, color:"#94A3B8", marginBottom:4, textAlign:"right", fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:600 }}>Score</div>
                  <div className="session-bar-bg">
                    <div className="session-bar-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
                <div className="session-score">{s.score}%</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── How It Works ── */}
        <div className="section-header">
          <div className="section-label">How It Works</div>
        </div>
        <div className="how-grid">
          {[
            { num: "01", step: "STEP 01", title: "Pick your focus",  desc: "Choose technical, behavioral, or mixed. Every session is tailored to your role and goals." },
            { num: "02", step: "STEP 02", title: "Answer questions", desc: "Respond via text or voice. The AI interviewer listens and evaluates your answers live." },
            { num: "03", step: "STEP 03", title: "Get feedback",     desc: "Detailed scores on clarity, pace, filler words, and content accuracy after each session." },
          ].map(h => {
            const Illus = HowIllustrations[h.step];
            return (
              <div className="how-card" key={h.step}>
                <div className="how-card-num">{h.num}</div>
                <div className="how-step">{h.step}</div>
                <Illus />
                <div className="how-title">{h.title}</div>
                <div className="how-desc">{h.desc}</div>
              </div>
            );
          })}
        </div>

      </div>

      {/* ── Change Role Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box fade-in" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕ Close</button>
            <div className="modal-title">Update your setup</div>
            <p className="modal-sub">Change your role or practice type anytime.</p>

            <div className="modal-step-nav">
              <button className={`modal-step-btn ${modalStep === 1 ? "active" : ""}`} onClick={() => setModalStep(1)}>① Role</button>
              <span className="modal-sep">→</span>
              <button className={`modal-step-btn ${modalStep === 2 ? "active" : ""}`} onClick={() => setModalStep(2)}>② Practice</button>
            </div>

            {modalStep === 1 && (
              <>
                <div className="role-grid" style={{ marginBottom:20 }}>
                  {ROLES.map(r => (
                    <div key={r.id} className={`role-card ${tempRole === r.id ? "selected" : ""}`} onClick={() => setTempRole(r.id)}>
                      <span className="role-emoji">{r.emoji}</span>
                      <div className="role-name">{r.label}</div>
                      <div className="role-desc">{r.desc}</div>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" disabled={!tempRole} onClick={() => setModalStep(2)}>Next →</button>
              </>
            )}

            {modalStep === 2 && (
              <>
                <div className="practice-list" style={{ marginBottom:20 }}>
                  {PRACTICE_TYPES.map(p => (
                    <div key={p.id} className={`practice-card ${tempPractice === p.id ? "selected" : ""}`} onClick={() => setTempPractice(p.id)}>
                      <div className="practice-icon-wrap">{p.icon}</div>
                      <div>
                        <div className="practice-name">
                          {p.label}
                          {p.recommended && <span className="badge-rec">RECOMMENDED</span>}
                        </div>
                        <div className="practice-desc">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="btn-row">
                  <button className="btn-ghost" onClick={() => setModalStep(1)}>← Back</button>
                  <button className="btn-primary" disabled={!tempPractice} onClick={saveModal}>Save changes</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}