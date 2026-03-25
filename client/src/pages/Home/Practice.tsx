import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { getToken, getUser, isLoggedIn, logout } from "../../../services/auth";

// ─── API ─────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:4000/api";

const ROLE_MAP = { ios: "SE", swe: "SE", frontend: "SE", data: "DS", other: "SE" };
const TYPE_MAP = { technical: "technical", behavioral: "generic" };

async function fetchQuestion(role, type) {
  const res = await fetch(
    `${BASE_URL}/questions/random?role=${ROLE_MAP[role] || "SE"}&type=${TYPE_MAP[type] || "technical"}`,
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to fetch question"); }
  return res.json();
}

async function submitAnswer(questionId, userAnswer) {
  const res = await fetch(`${BASE_URL}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ questionId, userAnswer }),
  });
  if (!res.ok) { const e = await res.json(); throw new Error(e.error || "Failed to submit answer"); }
  return res.json();
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #F1F5F9; color: #0F172A; }

  @keyframes fadeIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from { opacity:0; transform:translateX(24px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pop     { 0% { transform:scale(0.92); opacity:0; } 100% { transform:scale(1); opacity:1; } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  @keyframes pulse   { 0%,100% { opacity:0.6; } 50% { opacity:1; } }

  /* Recording pulse ring */
  @keyframes recordPulse {
    0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
    70%  { box-shadow: 0 0 0 14px rgba(239,68,68,0); }
    100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  }
  /* Waveform bar dance */
  @keyframes wave1 { 0%,100%{height:6px}  50%{height:20px} }
  @keyframes wave2 { 0%,100%{height:14px} 50%{height:6px}  }
  @keyframes wave3 { 0%,100%{height:8px}  50%{height:22px} }
  @keyframes wave4 { 0%,100%{height:18px} 50%{height:8px}  }
  @keyframes wave5 { 0%,100%{height:10px} 50%{height:18px} }

  .fade-in  { animation: fadeIn  0.4s ease forwards; }
  .slide-in { animation: slideIn 0.35s ease forwards; }
  .pop-in   { animation: pop     0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }

  /* ── NAVBAR ── */
  .navbar {
    height: 62px; background: white; border-bottom: 1px solid #E2E8F0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px; position: sticky; top: 0; z-index: 100;
    box-shadow: 0 1px 6px rgba(0,0,0,0.05);
  }
  .nav-left { display: flex; align-items: center; gap: 14px; }
  .nav-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
  .nav-logo-icon {
    width: 32px; height: 32px; border-radius: 9px;
    background: linear-gradient(135deg, #818CF8, #06B6D4);
    display: flex; align-items: center; justify-content: center; font-size: 16px;
  }
  .nav-logo-text { font-size: 15px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; color: #0F172A; }
  .nav-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #94A3B8; }
  .nav-breadcrumb a { color: #94A3B8; text-decoration: none; transition: color 0.15s; }
  .nav-breadcrumb a:hover { color: #6366F1; }
  .nav-breadcrumb span { color: #CBD5E1; }
  .nav-right { display: flex; align-items: center; gap: 12px; }
  .session-pill {
    display: flex; align-items: center; gap: 8px;
    background: #F8FAFC; border: 1.5px solid #E2E8F0;
    border-radius: 8px; padding: 6px 12px;
    font-size: 12px; font-weight: 600; color: #475569;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .session-pill-dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; animation: pulse 2s infinite; }
  .nav-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #818CF8, #06B6D4);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; color: white;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* ── LAYOUT ── */
  .practice-page {
    min-height: calc(100vh - 62px);
    display: grid; grid-template-columns: 300px 1fr 300px;
  }

  /* ── LEFT SIDEBAR ── */
  .sidebar-left {
    background: white; border-right: 1px solid #E2E8F0;
    padding: 28px 24px; display: flex; flex-direction: column; gap: 20px;
    position: sticky; top: 62px; height: calc(100vh - 62px); overflow-y: auto;
  }
  .sidebar-section-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    color: #CBD5E1; font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 10px;
  }
  .session-info-card {
    background: linear-gradient(135deg, #EEF2FF, #E0F2FE);
    border: 1.5px solid #C7D2FE; border-radius: 14px; padding: 18px;
  }
  .session-role { font-size: 13px; font-weight: 700; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 6px; }
  .session-type-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; color: #6366F1;
    background: white; border: 1px solid #C7D2FE; border-radius: 6px; padding: 3px 9px;
  }
  .stat-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F1F5F9; }
  .stat-row:last-child { border-bottom: none; }
  .stat-row-label { font-size: 12px; color: #64748B; }
  .stat-row-value { font-size: 14px; font-weight: 700; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; }
  .history-list { display: flex; flex-direction: column; gap: 8px; }
  .history-item {
    background: #F8FAFC; border: 1px solid #F1F5F9; border-radius: 10px;
    padding: 10px 12px; transition: all 0.15s;
  }
  .history-item:hover { background: #F5F3FF; border-color: #C7D2FE; }
  .history-item-q {
    font-size: 12px; color: #475569; line-height: 1.4; margin-bottom: 6px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .history-item-meta { display: flex; align-items: center; gap: 6px; }
  .correct-badge   { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: #F0FDF4; color: #10B981; }
  .incorrect-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: #FEF2F2; color: #EF4444; }
  .type-switcher { display: flex; background: #F1F5F9; border-radius: 10px; padding: 4px; gap: 2px; }
  .type-btn {
    flex: 1; padding: 8px 12px; border-radius: 7px; border: none;
    font-size: 12px; font-weight: 600; cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.18s;
    background: transparent; color: #64748B;
  }
  .type-btn.active { background: white; color: #6366F1; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

  /* ── MAIN AREA ── */
  .main-area { padding: 40px 48px; display: flex; flex-direction: column; gap: 24px; }

  /* Question card */
  .question-card {
    background: white; border: 1.5px solid #E2E8F0; border-radius: 20px;
    padding: 40px; position: relative; overflow: hidden;
  }
  .question-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg, #6366F1, #818CF8, #06B6D4);
  }
  .question-number {
    font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    color: #6366F1; font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .question-number-dot { width: 6px; height: 6px; border-radius: 50%; background: #6366F1; }
  .question-text {
    font-size: 22px; font-weight: 700; color: #0F172A;
    font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.45; margin-bottom: 8px;
  }
  .question-hint { font-size: 13px; color: #94A3B8; margin-bottom: 28px; }

  /* ── INPUT MODE TOGGLE ── */
  .input-mode-toggle {
    display: flex; gap: 8px; margin-bottom: 16px;
  }
  .mode-btn {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 10px;
    border: 1.5px solid #E2E8F0; background: white;
    font-size: 13px; font-weight: 600; color: #64748B;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.18s;
  }
  .mode-btn:hover { border-color: #A5B4FC; color: #6366F1; background: #F5F3FF; }
  .mode-btn.active { border-color: #6366F1; background: #EEF2FF; color: #6366F1; }
  .mode-btn .mode-icon { font-size: 15px; }

  /* Answer area */
  .answer-wrap { display: flex; flex-direction: column; gap: 14px; }
  .answer-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
    color: #94A3B8; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .answer-textarea {
    width: 100%; min-height: 160px; padding: 16px 18px; border-radius: 14px;
    border: 1.5px solid #E2E8F0; background: #FAFBFD;
    font-size: 15px; font-family: 'Inter', sans-serif; color: #0F172A;
    line-height: 1.65; resize: vertical; transition: border-color 0.2s, box-shadow 0.2s; outline: none;
  }
  .answer-textarea:focus { border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); background: white; }
  .answer-textarea::placeholder { color: #CBD5E1; }
  .answer-textarea:disabled { opacity: 0.6; cursor: not-allowed; }
  /* Glows blue while transcribing live */
  .answer-textarea.listening { border-color: #6366F1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); background: white; }

  .answer-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .char-count { font-size: 12px; color: #CBD5E1; font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── VOICE PANEL ── */
  .voice-panel {
    border: 1.5px solid #E2E8F0; border-radius: 16px;
    background: #FAFBFD; overflow: hidden;
  }

  /* Top section: mic button + waveform */
  .voice-main {
    display: flex; flex-direction: column; align-items: center;
    padding: 36px 24px 28px; gap: 20px;
  }

  /* The big mic button */
  .mic-btn {
    width: 80px; height: 80px; border-radius: 50%; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; position: relative; flex-shrink: 0;
  }
  .mic-btn-idle {
    background: linear-gradient(135deg, #6366F1, #818CF8);
    box-shadow: 0 8px 24px rgba(99,102,241,0.35);
  }
  .mic-btn-idle:hover { transform: scale(1.06); box-shadow: 0 12px 32px rgba(99,102,241,0.45); }
  .mic-btn-recording {
    background: linear-gradient(135deg, #EF4444, #F87171);
    box-shadow: 0 8px 24px rgba(239,68,68,0.35);
    animation: recordPulse 1.5s ease-out infinite;
  }

  /* Mic SVG icon */
  .mic-icon { width: 32px; height: 32px; }

  /* Waveform bars — only visible while recording */
  .waveform {
    display: flex; align-items: center; gap: 4px; height: 28px;
  }
  .waveform-bar {
    width: 4px; border-radius: 2px; background: #6366F1;
    transition: background 0.2s;
  }
  .waveform-bar.active-1 { animation: wave1 0.8s ease-in-out infinite; }
  .waveform-bar.active-2 { animation: wave2 0.8s ease-in-out infinite 0.1s; }
  .waveform-bar.active-3 { animation: wave3 0.8s ease-in-out infinite 0.2s; }
  .waveform-bar.active-4 { animation: wave4 0.8s ease-in-out infinite 0.15s; }
  .waveform-bar.active-5 { animation: wave5 0.8s ease-in-out infinite 0.05s; }
  .waveform-bar.inactive { height: 4px; background: #E2E8F0; }
  .waveform-bar.recording { background: #EF4444; }

  .voice-status {
    font-size: 14px; font-weight: 600; color: #475569;
    font-family: 'Plus Jakarta Sans', sans-serif; text-align: center;
  }
  .voice-status.recording-text { color: #EF4444; }
  .voice-status-sub { font-size: 12px; color: #94A3B8; margin-top: 3px; text-align: center; }

  /* Live transcript preview box */
  .transcript-preview {
    margin: 0 16px 16px;
    background: white; border: 1.5px solid #E2E8F0; border-radius: 12px;
    padding: 14px 16px; min-height: 60px;
    font-size: 14px; color: #475569; line-height: 1.6; font-style: italic;
  }
  .transcript-preview.has-text { color: #0F172A; font-style: normal; }
  .transcript-placeholder { color: #CBD5E1; font-style: italic; font-size: 13px; }

  /* Browser warning banner */
  .voice-warning {
    margin: 0 16px 16px;
    background: #FFFBEB; border: 1px solid #FDE68A;
    border-radius: 10px; padding: 10px 14px;
    font-size: 12px; color: #92400E; line-height: 1.5;
    display: flex; gap: 8px; align-items: flex-start;
  }

  /* Buttons */
  .btn-submit {
    padding: 13px 32px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #1e1b4b, #4F46E5);
    color: white; font-size: 14px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 6px 20px rgba(79,70,229,0.28);
    display: flex; align-items: center; gap: 8px;
  }
  .btn-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .btn-submit:disabled { background: #E2E8F0; color: #94A3B8; box-shadow: none; cursor: not-allowed; }
  .btn-next {
    padding: 13px 28px; border-radius: 12px; border: none;
    background: linear-gradient(135deg, #059669, #10B981);
    color: white; font-size: 14px; font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 6px 18px rgba(16,185,129,0.3);
    display: flex; align-items: center; gap: 8px;
  }
  .btn-next:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-skip {
    padding: 13px 20px; border-radius: 12px;
    border: 1.5px solid #E2E8F0; background: white;
    color: #94A3B8; font-size: 14px; font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-skip:hover { border-color: #CBD5E1; color: #64748B; }
  .spinner {
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.35); border-top-color: white;
    border-radius: 50%; animation: spin 0.65s linear infinite; display: inline-block;
  }

  /* ── RESULT PANEL ── */
  .result-panel {
    border-radius: 16px; padding: 24px 28px; border: 1.5px solid;
    animation: pop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  .result-correct   { background: #F0FDF4; border-color: #86EFAC; }
  .result-incorrect { background: #FEF2F2; border-color: #FCA5A5; }
  .result-header { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .result-icon { width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .result-icon-correct   { background: #DCFCE7; }
  .result-icon-incorrect { background: #FEE2E2; }
  .result-title { font-size: 17px; font-weight: 800; font-family: 'Plus Jakarta Sans', sans-serif; }
  .result-correct   .result-title { color: #15803D; }
  .result-incorrect .result-title { color: #DC2626; }
  .result-subtitle { font-size: 13px; color: #64748B; margin-top: 2px; }
  .result-answer-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;
    color: #94A3B8; font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 8px;
  }
  .result-answer-box {
    background: white; border-radius: 10px; padding: 14px 16px;
    font-size: 14px; color: #0F172A; line-height: 1.6; border: 1px solid rgba(0,0,0,0.06);
  }

  /* ── RIGHT SIDEBAR ── */
  .sidebar-right {
    background: white; border-left: 1px solid #E2E8F0;
    padding: 28px 24px; position: sticky; top: 62px;
    height: calc(100vh - 62px); overflow-y: auto;
    display: flex; flex-direction: column; gap: 20px;
  }
  .tip-card {
    background: linear-gradient(135deg, #FEFCE8, #FEF9C3);
    border: 1.5px solid #FDE68A; border-radius: 14px; padding: 18px;
  }
  .tip-card-title { font-size: 13px; font-weight: 700; color: #92400E; font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 10px; }
  .tip-item { font-size: 12px; color: #78350F; line-height: 1.6; margin-bottom: 6px; display: flex; gap: 8px; }
  .tip-item::before { content: '→'; color: #F59E0B; flex-shrink: 0; font-weight: 700; }
  .shortcut-card { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 18px; }
  .shortcut-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .shortcut-row:last-child { margin-bottom: 0; }
  .shortcut-label { font-size: 12px; color: #64748B; }
  .shortcut-key { font-size: 11px; font-weight: 600; background: white; border: 1px solid #E2E8F0; border-radius: 5px; padding: 2px 7px; color: #475569; font-family: 'Plus Jakarta Sans', sans-serif; }
  .accuracy-card { background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px; padding: 20px; text-align: center; }
  .accuracy-title { font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: #94A3B8; font-family: 'Plus Jakarta Sans', sans-serif; margin-bottom: 14px; }
  .accuracy-value { font-size: 36px; font-weight: 800; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1; }
  .accuracy-sub   { font-size: 12px; color: #94A3B8; margin-top: 4px; }
  .accuracy-bar   { height: 6px; background: #E2E8F0; border-radius: 3px; overflow: hidden; margin-top: 14px; }
  .accuracy-fill  { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #6366F1, #10B981); transition: width 0.6s ease; }

  /* Loading / empty states */
  .state-center { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 40px; gap: 16px; text-align: center; }
  .state-icon   { font-size: 48px; }
  .state-title  { font-size: 20px; font-weight: 700; color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; }
  .state-sub    { font-size: 14px; color: #94A3B8; line-height: 1.6; max-width: 320px; }
  .loading-spinner-lg { width: 40px; height: 40px; border: 3px solid #E2E8F0; border-top-color: #6366F1; border-radius: 50%; animation: spin 0.7s linear infinite; }

  @media (max-width: 1100px) {
    .practice-page { grid-template-columns: 260px 1fr; }
    .sidebar-right { display: none; }
  }
  @media (max-width: 768px) {
    .practice-page { grid-template-columns: 1fr; }
    .sidebar-left  { display: none; }
    .main-area     { padding: 24px 18px; }
    .navbar        { padding: 0 18px; }
  }
`;

// ─── SVG ILLUSTRATIONS ────────────────────────────────────────────────────────

const MicIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="2" width="6" height="11" rx="3" fill="white" fillOpacity="0.95" />
    <path d="M5 10C5 13.866 8.13401 17 12 17C15.866 17 19 13.866 19 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="17" x2="12" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="9" y1="21" x2="15" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const KeyboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const EmptyIllustration = () => (
  <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 120, height: 100 }}>
    <rect x="10" y="20" width="100" height="70" rx="12" fill="#EEF2FF" />
    <rect x="22" y="34" width="76" height="8" rx="4" fill="#C7D2FE" />
    <rect x="22" y="48" width="56" height="6" rx="3" fill="#E0E7FF" />
    <rect x="22" y="58" width="44" height="6" rx="3" fill="#E0E7FF" />
    <circle cx="95" cy="28" r="16" fill="#6366F1" />
    <text x="89" y="33" fill="white" fontSize="14" fontWeight="800">?</text>
  </svg>
);

const CorrectIllustration = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 56, height: 56 }}>
    <circle cx="40" cy="40" r="38" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="2" />
    <path d="M24 40 L34 50 L56 28" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IncorrectIllustration = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 56, height: 56 }}>
    <circle cx="40" cy="40" r="38" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="2" />
    <path d="M28 28 L52 52M52 28 L28 52" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

// ─── VOICE PANEL COMPONENT ────────────────────────────────────────────────────
// Handles all speech recognition logic in one place

function VoicePanel({ onTranscript, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [liveText,    setLiveText]    = useState("");
  const [supported,   setSupported]   = useState(true);

  // MediaRecorder holds the mic open — it never self-terminates on silence
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // SpeechRecognition runs alongside for live text only
  const recognitionRef   = useRef<any>(null);
  const isRecordingRef   = useRef(false);
  const finalTextRef     = useRef("");

  useEffect(() => {
    const hasMediaDevices  = !!navigator.mediaDevices?.getUserMedia;
    const hasSpeechRecognition = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!hasMediaDevices || !hasSpeechRecognition) setSupported(false);
    return () => stopAll();
  }, []);

  // ── Speech Recognition (live text only) ─────────────────────────────────────
  function startSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition || !isRecordingRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      let newFinal = finalTextRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinal += (newFinal ? " " : "") + t.trim();
        } else {
          interim = t;
        }
      }
      finalTextRef.current = newFinal;
      setLiveText(interim);
      onTranscript(newFinal + (interim ? " " + interim : ""));
    };

    // Ignore transient errors — MediaRecorder keeps the mic open regardless
    recognition.onerror = () => {};

    recognition.onend = () => {
      // Restart the recognition session; mic stays open via MediaRecorder
      if (isRecordingRef.current) {
        setTimeout(() => {
          if (isRecordingRef.current) startSpeechRecognition();
        }, 150);
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (_) {}
  }

  // ── MediaRecorder (keeps mic alive) ─────────────────────────────────────────
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.start();

      isRecordingRef.current = true;
      setIsRecording(true);
      setLiveText("");
      finalTextRef.current = "";

      startSpeechRecognition();
    } catch (err) {
      console.error("Microphone access error:", err);
    }
  }

  function stopAll() {
    isRecordingRef.current = false;

    recognitionRef.current?.stop();
    recognitionRef.current = null;

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
    }

    setIsRecording(false);
    setLiveText("");
    onTranscript(finalTextRef.current);
  }

  function toggleRecording() {
    if (isRecording) stopAll();
    else startRecording();
  }

  // Stop and reset when disabled (result shown or submitting)
  useEffect(() => {
    if (disabled) {
      finalTextRef.current = "";
      stopAll();
    }
  }, [disabled]);

  const displayText = finalTextRef.current + (liveText ? (finalTextRef.current ? " " : "") + liveText : "");

  return (
    <div className="voice-panel">
      {/* Mic button + waveform */}
      <div className="voice-main">
        <button
          className={`mic-btn ${isRecording ? "mic-btn-recording" : "mic-btn-idle"}`}
          onClick={toggleRecording}
          disabled={disabled || !supported}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          <MicIcon size={32} />
        </button>

        {/* Animated waveform — active when recording */}
        <div className="waveform">
          {[1,2,3,4,5,6,7,8,9].map(i => (
            <div
              key={i}
              className={`waveform-bar ${
                isRecording
                  ? `active-${(i % 5) + 1} recording`
                  : "inactive"
              }`}
            />
          ))}
        </div>

        <div>
          <div className={`voice-status ${isRecording ? "recording-text" : ""}`}>
            {isRecording ? "🔴 Recording…" : "Tap to speak"}
          </div>
          <div className="voice-status-sub">
            {isRecording
              ? "Speak clearly — tap again to stop"
              : "Your answer will be transcribed automatically"
            }
          </div>
        </div>
      </div>

      {/* Live transcript preview */}
      <div className={`transcript-preview ${displayText ? "has-text" : ""}`}>
        {displayText || <span className="transcript-placeholder">Your speech will appear here…</span>}
      </div>

      {/* Browser support warning */}
      {!supported && (
        <div className="voice-warning">
          ⚠️ Voice input requires Chrome or Edge. Please switch browsers or use the keyboard instead.
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Practice() {
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const currentUser = getUser();

  useEffect(() => {
    if (!isLoggedIn()) navigate("/login");
  }, []);

  const roleParam = params.get("role") || "swe";
  const typeParam = params.get("type") || "technical";

  const [activeType,   setActiveType]   = useState(typeParam === "both" ? "technical" : typeParam);

  // Question state
  const [question,    setQuestion]    = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [qError,      setQError]      = useState<string | null>(null);

  // Answer state
  const [answer,      setAnswer]      = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [result,      setResult]      = useState<{ isCorrect: boolean; correctAnswer?: string } | null>(null);
  const [submitError, setSubmitError] = useState(null);

  // Input mode: "type" | "voice"
  const [inputMode, setInputMode] = useState("type");

  // Session stats
  const [qCount,   setQCount]   = useState(0);
  const [correct,  setCorrect]  = useState(0);
  const [history,  setHistory]  = useState([]);

  const textareaRef = useRef(null);

  useEffect(() => { loadQuestion(); }, [activeType]);

  // Keyboard shortcut: Cmd/Ctrl+Enter
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (answer.trim() && !result && !submitting) handleSubmit();
        if (result) handleNext();
      }
      if (e.key === "Escape" && !result) handleSkip();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, result, submitting]);

  async function loadQuestion() {
    setLoading(true);
    setQError(null);
    setQuestion(null);
    setAnswer("");
    setResult(null);
    setSubmitError(null);
    try {
      const q = await fetchQuestion(roleParam, activeType);
      setQuestion(q);
      if (inputMode === "type") setTimeout(() => textareaRef.current?.focus(), 100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("invalid")) {
        logout(); navigate("/login"); return;
      }
      setQError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!answer.trim() || !question) return;
    setSubmitting(true); 
    setSubmitError(null);
    try {
      const res = await submitAnswer(question.id, answer.trim());
      setResult(res);
      setQCount(c => c + 1);
      if (res.isCorrect) setCorrect(c => c + 1);
      setHistory(h => [{ q: question.question_text, isCorrect: res.isCorrect }, ...h.slice(0, 9)]);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext()  { loadQuestion(); }
  function handleSkip()  { loadQuestion(); }

  // Called by VoicePanel with the live transcript — drops it into the answer box
  function handleVoiceTranscript(text) { setAnswer(text); }

  const accuracy  = qCount === 0 ? 0 : Math.round((correct / qCount) * 100);
  const userEmail = currentUser?.email || "";
  const userInitials = userEmail.split("@")[0].split(/[.\-_]/).map(p => p[0]?.toUpperCase() || "").slice(0, 2).join("") || "?";
  const typeLabel = activeType === "technical" ? "Technical" : "Behavioral";
  const roleLabel = { ios:"iOS Developer", swe:"Software Engineer", data:"Data Analyst", frontend:"Frontend", other:"Other" }[roleParam] || roleParam;

  return (
    <>
      <style>{css}</style>

      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">⚡</div>
            <span className="nav-logo-text">InterviewAI</span>
          </Link>
          <div className="nav-breadcrumb">
            <span>›</span>
            <Link to="/">Dashboard</Link>
            <span>›</span>
            <span style={{ color: "#475569", fontWeight: 600 }}>Practice</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="session-pill">
            <div className="session-pill-dot" />
            Session active · Q{qCount + 1}
          </div>
          <div className="nav-avatar" title={userEmail}>{userInitials}</div>
        </div>
      </nav>

      <div className="practice-page">

        {/* ── Left Sidebar ── */}
        <aside className="sidebar-left fade-in">

          <div>
            <div className="sidebar-section-label">This session</div>
            <div className="session-info-card">
              <div className="session-role">{roleLabel}</div>
              <div style={{ marginTop: 8 }}>
                <div className="session-type-badge">
                  {activeType === "technical" ? "⌥" : "◎"} {typeLabel}
                </div>
              </div>
            </div>
          </div>

          {typeParam === "both" && (
            <div>
              <div className="sidebar-section-label">Switch type</div>
              <div className="type-switcher">
                <button className={`type-btn ${activeType === "technical"  ? "active" : ""}`} onClick={() => setActiveType("technical")}>⌥ Technical</button>
                <button className={`type-btn ${activeType === "behavioral" ? "active" : ""}`} onClick={() => setActiveType("behavioral")}>◎ Behavioral</button>
              </div>
            </div>
          )}

          <div>
            <div className="sidebar-section-label">Live stats</div>
            <div className="stat-row"><span className="stat-row-label">Questions done</span><span className="stat-row-value">{qCount}</span></div>
            <div className="stat-row"><span className="stat-row-label">Correct</span><span className="stat-row-value" style={{ color:"#10B981" }}>{correct}</span></div>
            <div className="stat-row"><span className="stat-row-label">Incorrect</span><span className="stat-row-value" style={{ color:"#EF4444" }}>{qCount - correct}</span></div>
            <div className="stat-row"><span className="stat-row-label">Accuracy</span><span className="stat-row-value" style={{ color:"#6366F1" }}>{accuracy}%</span></div>
          </div>

          {history.length > 0 && (
            <div>
              <div className="sidebar-section-label">Recent answers</div>
              <div className="history-list">
                {history.map((h, i) => (
                  <div className="history-item" key={i}>
                    <div className="history-item-q">{h.q}</div>
                    <div className="history-item-meta">
                      {h.isCorrect
                        ? <span className="correct-badge">✓ Correct</span>
                        : <span className="incorrect-badge">✗ Incorrect</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Main ── */}
        <main className="main-area">

          {loading && (
            <div className="question-card fade-in">
              <div className="state-center">
                <div className="loading-spinner-lg" />
                <div className="state-title">Loading question…</div>
                <div className="state-sub">Fetching a {typeLabel.toLowerCase()} question for {roleLabel}</div>
              </div>
            </div>
          )}

          {!loading && qError && (
            <div className="question-card fade-in">
              <div className="state-center">
                <div className="state-icon">⚠️</div>
                <div className="state-title">Couldn't load question</div>
                <div className="state-sub">{qError}</div>
                <button className="btn-submit" style={{ marginTop: 8 }} onClick={loadQuestion}>Try again</button>
              </div>
            </div>
          )}

          {!loading && question && (
            <div className="question-card slide-in">
              {/* Question header */}
              <div className="question-number">
                <div className="question-number-dot" />
                Question {qCount + 1} · {typeLabel}
              </div>
              <div className="question-text">{question.question_text}</div>
              <div className="question-hint">Answer by typing or speaking — whichever feels natural.</div>

              {/* ── Input mode toggle ── */}
              <div className="input-mode-toggle">
                <button
                  className={`mode-btn ${inputMode === "type" ? "active" : ""}`}
                  onClick={() => setInputMode("type")}
                  disabled={!!result}
                >
                  <span className="mode-icon"><KeyboardIcon /></span>
                  Type answer
                </button>
                <button
                  className={`mode-btn ${inputMode === "voice" ? "active" : ""}`}
                  onClick={() => setInputMode("voice")}
                  disabled={!!result}
                >
                  <span className="mode-icon">🎤</span>
                  Record voice
                </button>
              </div>

              <div className="answer-wrap">

                {/* ── TYPE MODE ── */}
                {inputMode === "type" && (
                  <>
                    <div className="answer-label">Your answer</div>
                    <textarea
                      ref={textareaRef}
                      className="answer-textarea"
                      placeholder="Write your answer here…"
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      disabled={!!result || submitting}
                      rows={6}
                    />
                  </>
                )}

                {/* ── VOICE MODE ── */}
                {inputMode === "voice" && (
                  <>
                    <VoicePanel
                      key={(question as any)?.id}
                      onTranscript={handleVoiceTranscript}
                      disabled={!!result || submitting}
                    />

                    {/* Editable textarea shows the transcript so user can fix mistakes */}
                    {answer && (
                      <div>
                        <div className="answer-label" style={{ marginBottom: 8 }}>
                          Transcribed — edit if needed
                        </div>
                        <textarea
                          className={`answer-textarea ${answer ? "listening" : ""}`}
                          value={answer}
                          onChange={e => setAnswer(e.target.value)}
                          disabled={!!result || submitting}
                          rows={4}
                          placeholder="Your transcribed answer will appear here…"
                        />
                      </div>
                    )}
                  </>
                )}

                {submitError && (
                  <div style={{ fontSize:13, color:"#DC2626", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px" }}>
                    ⚠ {submitError}
                  </div>
                )}

                {/* Action buttons */}
                <div className="answer-actions">
                  <span className="char-count">{answer.length} chars</span>
                  <div style={{ display:"flex", gap:10 }}>
                    {!result ? (
                      <>
                        <button className="btn-skip" onClick={handleSkip} disabled={submitting}>Skip</button>
                        <button className="btn-submit" onClick={handleSubmit} disabled={!answer.trim() || submitting}>
                          {submitting ? <><span className="spinner" /> Submitting…</> : "Submit →"}
                        </button>
                      </>
                    ) : (
                      <button className="btn-next" onClick={handleNext}>Next question →</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result panel */}
          {result && (
            <div className={`result-panel ${result.isCorrect ? "result-correct" : "result-incorrect"}`}>
              <div className="result-header">
                <div className={`result-icon ${result.isCorrect ? "result-icon-correct" : "result-icon-incorrect"}`}>
                  {result.isCorrect ? <CorrectIllustration /> : <IncorrectIllustration />}
                </div>
                <div>
                  <div className="result-title">{result.isCorrect ? "Correct! Well done." : "Not quite right."}</div>
                  <div className="result-subtitle">
                    {result.isCorrect ? "Your answer matched. Keep it up!" : "Review the correct answer below."}
                  </div>
                </div>
              </div>
              {result.correctAnswer && (
                <div style={{ marginTop:4 }}>
                  <div className="result-answer-label">Correct answer</div>
                  <div className="result-answer-box">{result.correctAnswer}</div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!loading && !question && !qError && (
            <div className="question-card fade-in">
              <div className="state-center">
                <EmptyIllustration />
                <div className="state-title">Ready to start?</div>
                <div className="state-sub">Load your first {typeLabel.toLowerCase()} question to begin.</div>
                <button className="btn-submit" style={{ marginTop:8 }} onClick={loadQuestion}>Load question</button>
              </div>
            </div>
          )}

        </main>

        {/* ── Right Sidebar ── */}
        <aside className="sidebar-right fade-in">

          <div>
            <div className="sidebar-section-label">Session accuracy</div>
            <div className="accuracy-card">
              <div className="accuracy-title">Accuracy</div>
              <div className="accuracy-value">{accuracy}%</div>
              <div className="accuracy-sub">{correct} of {qCount} correct</div>
              <div className="accuracy-bar">
                <div className="accuracy-fill" style={{ width:`${accuracy}%` }} />
              </div>
            </div>
          </div>

          <div>
            <div className="sidebar-section-label">Answer tips</div>
            <div className="tip-card">
              <div className="tip-card-title">💡 Tips for better answers</div>
              <div className="tip-item">Be specific — avoid vague terms like "it depends"</div>
              <div className="tip-item">Use examples to back up your points</div>
              <div className="tip-item">Structure with: situation → action → result</div>
              <div className="tip-item">Keep answers concise but complete</div>
            </div>
          </div>

          <div>
            <div className="sidebar-section-label">Keyboard shortcuts</div>
            <div className="shortcut-card">
              <div className="shortcut-row"><span className="shortcut-label">Submit answer</span><span className="shortcut-key">⌘ Enter</span></div>
              <div className="shortcut-row"><span className="shortcut-label">Next question</span><span className="shortcut-key">⌘ Enter</span></div>
              <div className="shortcut-row"><span className="shortcut-label">Skip question</span><span className="shortcut-key">Esc</span></div>
            </div>
          </div>

        </aside>
      </div>
    </>
  );
}