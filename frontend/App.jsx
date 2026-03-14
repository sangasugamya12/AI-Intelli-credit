import { useState, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

/* ═══════════════════════════════ THEME ══════════════════════════════════════ */
const C = {
  bg:        "#05070F",
  surface:   "#090D1A",
  card:      "#0D1220",
  lift:      "#111828",
  border:    "#182035",
  borderHi:  "#243258",
  cyan:      "#00D4FF",
  cyanDim:   "rgba(0,212,255,0.10)",
  cyanGlow:  "rgba(0,212,255,0.22)",
  gold:      "#FFBB00",
  goldDim:   "rgba(255,187,0,0.10)",
  green:     "#00E5A0",
  greenDim:  "rgba(0,229,160,0.10)",
  red:       "#FF3B60",
  redDim:    "rgba(255,59,96,0.10)",
  orange:    "#FF8A30",
  orangeDim: "rgba(255,138,48,0.10)",
  violet:    "#9B7FFF",
  violetDim: "rgba(155,127,255,0.10)",
  text:      "#D0DCF0",
  sub:       "#8AA4C8",
  muted:     "#5A7096",
};

/* ═══════════════════════════════ GLOBAL CSS ═════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Figtree:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  background: ${C.bg};
  color: ${C.text};
  font-family: 'Figtree', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}
::-webkit-scrollbar { width: 3px; background: ${C.surface}; }
::-webkit-scrollbar-thumb { background: ${C.cyan}; border-radius: 2px; }

/* ── Animations ── */
@keyframes fadeUp   { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
@keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
@keyframes spin     { to { transform:rotate(360deg) } }
@keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:.35 } }
@keyframes glow     { 0%,100% { box-shadow:0 0 8px ${C.cyanGlow} } 50% { box-shadow:0 0 28px ${C.cyanGlow} } }
@keyframes scanDown { from { top:-2px } to { top:100% } }
@keyframes barIn    { from { transform:scaleX(0) } to { transform:scaleX(1) } }
@keyframes popIn    { from { opacity:0;transform:scale(.85) } to { opacity:1;transform:scale(1) } }
@keyframes shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
@keyframes typeOn   { from{width:0} to{width:100%} }
@keyframes blink    { 50%{opacity:0} }
@keyframes rowIn    { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
@keyframes tagPop   { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
@keyframes ripple   { from{transform:scale(1);opacity:.5} to{transform:scale(2.5);opacity:0} }

.fu  { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both }
.fi  { animation: fadeIn .35s ease both }
.pi  { animation: popIn  .3s cubic-bezier(.34,1.56,.64,1) both }

/* ── Layout shell ── */
.shell {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 100vh;
}

/* ── Sidebar ── */
.sidebar {
  background: ${C.surface};
  border-right: 1px solid ${C.border};
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

/* ── Tab items ── */
.tab-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 18px;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  position: relative;
  transition: background .2s;
  border-bottom: 1px solid ${C.border};
}
.tab-item:hover { background: rgba(255,255,255,.025); }
.tab-item.active { background: ${C.cyanDim}; }
.tab-item::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: transparent;
  transition: background .2s;
}
.tab-item.active::before { background: ${C.cyan}; }
.tab-item.done::before { background: ${C.green}; }
.tab-badge {
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800;
  flex-shrink: 0;
  transition: all .25s;
  font-family: 'DM Mono', monospace;
}

/* ── Cards ── */
.card {
  background: ${C.card};
  border: 1px solid ${C.border};
  border-radius: 14px;
  overflow: hidden;
}
.card-head {
  padding: 16px 20px;
  border-bottom: 1px solid ${C.border};
  display: flex;
  align-items: center;
  gap: 10px;
}
.card-body { padding: 20px; }

/* ── Inputs ── */
.inp {
  width: 100%;
  background: ${C.lift};
  border: 1px solid ${C.border};
  border-radius: 9px;
  color: ${C.text};
  font-family: 'Figtree', sans-serif;
  font-size: 14px;
  padding: 11px 14px;
  outline: none;
  transition: all .2s;
}
.inp:focus { border-color: rgba(0,212,255,.5); background: rgba(0,212,255,.04); box-shadow: 0 0 0 3px rgba(0,212,255,.08); }
.inp::placeholder { color: ${C.muted}; }
textarea.inp { resize: vertical; min-height: 88px; line-height: 1.65; }
.lbl { font-size: 12px; font-weight: 700; color: ${C.text}; letter-spacing: .5px; text-transform: uppercase; margin-bottom: 6px; display: block; }

/* ── Buttons ── */
.btn {
  border: none;
  border-radius: 9px;
  font-family: 'Figtree', sans-serif;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all .2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.btn-primary {
  background: linear-gradient(135deg, ${C.cyan}, #008FAA);
  color: #05070F;
  padding: 12px 28px;
  box-shadow: 0 4px 18px ${C.cyanGlow};
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px ${C.cyanGlow}; }
.btn-primary:disabled { opacity: .4; cursor: not-allowed; transform: none; box-shadow: none; }
.btn-outline { background: transparent; color: ${C.cyan}; border: 1.5px solid rgba(0,212,255,.35); padding: 10px 22px; }
.btn-outline:hover { background: ${C.cyanDim}; }
.btn-ghost { background: transparent; color: ${C.sub}; border: 1px solid ${C.border}; padding: 9px 18px; font-size: 12px; }
.btn-ghost:hover { color: ${C.text}; border-color: ${C.borderHi}; }
.btn-gold { background: linear-gradient(135deg, ${C.gold}, #B38000); color: #05070F; padding: 12px 28px; }
.btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(255,187,0,.35); }

/* ── Tags ── */
.tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 99px;
  font-size: 11px; font-weight: 800; letter-spacing: 0.6px; text-transform: uppercase;
}
.t-cyan   { background: ${C.cyanDim};   color: ${C.cyan};   border: 1px solid rgba(0,212,255,.25); }
.t-gold   { background: ${C.goldDim};   color: ${C.gold};   border: 1px solid rgba(255,187,0,.25); }
.t-green  { background: ${C.greenDim};  color: ${C.green};  border: 1px solid rgba(0,229,160,.25); }
.t-red    { background: ${C.redDim};    color: ${C.red};    border: 1px solid rgba(255,59,96,.25); }
.t-orange { background: ${C.orangeDim}; color: ${C.orange}; border: 1px solid rgba(255,138,48,.25); }
.t-violet { background: ${C.violetDim}; color: ${C.violet}; border: 1px solid rgba(155,127,255,.25); }

/* ── Table ── */
.tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
.tbl th { background: ${C.surface}; color: ${C.text}; font-size: 11px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; padding: 9px 12px; text-align: left; border-bottom: 1px solid ${C.border}; position: sticky; top: 0; }
.tbl td { padding: 8px 12px; border-bottom: 1px solid ${C.border}; color: ${C.text}; font-family: 'DM Mono', monospace; animation: rowIn .25s ease both; }
.tbl tr:last-child td { border-bottom: none; }
.tbl tr:hover td { background: rgba(0,212,255,.025); }

/* ── Drop zone ── */
.dropzone {
  border: 2px dashed ${C.borderHi};
  border-radius: 12px;
  padding: 36px 20px;
  text-align: center;
  cursor: pointer;
  transition: all .25s;
  background: ${C.lift};
  position: relative;
  overflow: hidden;
}
.dropzone:hover, .dropzone.over { border-color: ${C.cyan}; background: ${C.cyanDim}; transform: scale(1.01); }
.dropzone.gold:hover, .dropzone.gold.over { border-color: ${C.gold}; background: ${C.goldDim}; }
.dropzone.green:hover, .dropzone.green.over { border-color: ${C.green}; background: ${C.greenDim}; }
.dropzone.violet:hover, .dropzone.violet.over { border-color: ${C.violet}; background: ${C.violetDim}; }
.dropzone.done { border-style: solid; border-color: ${C.green}; background: ${C.greenDim}; }

/* ── Scan line ── */
.scan-wrap { position: relative; overflow: hidden; }
.scan-wrap::after {
  content: '';
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, ${C.cyan}, transparent);
  animation: scanDown 2s linear infinite; opacity: .45;
}

/* ── Risk bar ── */
.rbar { height: 5px; border-radius: 3px; background: ${C.border}; overflow: hidden; }
.rfill { height: 100%; border-radius: 3px; transform-origin: left; transition: width 1.4s cubic-bezier(.4,0,.2,1); }

/* ── Ratio chip ── */
.ratio-chip {
  padding: 12px 14px;
  background: ${C.lift};
  border: 1px solid ${C.border};
  border-radius: 10px;
}
.ratio-v { font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 500; line-height: 1; margin-top: 3px; }

/* ── Extraction card ── */
.extract-card {
  padding: 12px 14px;
  background: ${C.lift};
  border: 1px solid ${C.border};
  border-radius: 10px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all .2s;
  animation: rowIn .3s ease both;
}
.extract-card:hover { border-color: ${C.borderHi}; background: ${C.card}; }
.extract-card.flagged { border-color: rgba(255,59,96,.3); background: ${C.redDim}; }
.extract-card.warn { border-color: rgba(255,138,48,.3); background: ${C.orangeDim}; }
.extract-card.ok { border-color: rgba(0,229,160,.3); background: ${C.greenDim}; }

/* ── DD note chip ── */
.note-chip {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 14px;
  background: ${C.lift};
  border: 1px solid ${C.border};
  border-radius: 10px;
  margin-bottom: 8px;
  animation: rowIn .3s ease both;
}

/* ── Sentiment bar ── */
.sent-bar {
  height: 8px; border-radius: 4px;
  background: linear-gradient(90deg, ${C.green}, ${C.gold}, ${C.red});
  position: relative; overflow: hidden;
}
.sent-cursor {
  position: absolute; top: -3px; width: 14px; height: 14px;
  background: white; border-radius: 50%;
  border: 2px solid ${C.bg};
  box-shadow: 0 2px 8px rgba(0,0,0,.5);
  transform: translateX(-50%);
  transition: left .8s cubic-bezier(.4,0,.2,1);
}

/* ── Tooltip ── */
.recharts-default-tooltip { background: ${C.card} !important; border: 1px solid ${C.border} !important; border-radius: 8px !important; font-family: 'Figtree', sans-serif; font-size: 13px !important; }

/* ── Section label ── */
.sec-lbl { font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: ${C.text}; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.sec-lbl::after { content: ''; flex: 1; height: 1px; background: ${C.border}; }

/* ── Step progress (top bar) ── */
.top-bar {
  height: 56px;
  background: ${C.surface};
  border-bottom: 1px solid ${C.border};
  display: flex; align-items: center;
  padding: 0 28px; gap: 0;
  position: sticky; top: 0; z-index: 200;
}
.snode { display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; min-width: 64px; }
.scirc {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; transition: all .3s;
  font-family: 'DM Mono', monospace;
}
.scirc.done   { background: ${C.green}; color: #05070F; }
.scirc.active { background: ${C.cyan}; color: #05070F; animation: glow 2s ease infinite; }
.scirc.pend   { background: ${C.lift}; color: ${C.muted}; border: 1px solid ${C.border}; }
.sline { flex: 1; height: 2px; border-radius: 1px; margin: 0 3px; margin-bottom: 14px; transition: background .5s; }
.slbl { font-size: 10px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; white-space: nowrap; }

/* ── File chip ── */
.file-chip {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 12px;
  background: ${C.lift};
  border: 1px solid ${C.border};
  border-radius: 9px;
  margin-bottom: 6px;
  animation: rowIn .25s ease both;
}
.fc-name { flex: 1; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fc-size { font-size: 12px; color: ${C.text}; font-family: 'DM Mono', monospace; flex-shrink: 0; }
.fc-rm { color: ${C.muted}; cursor: pointer; flex-shrink: 0; transition: color .15s; border: none; background: none; padding: 0; }
.fc-rm:hover { color: ${C.red}; }

/* ── Spinner ── */
.spin { width: 14px; height: 14px; border: 2px solid ${C.border}; border-top-color: ${C.cyan}; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .shell { grid-template-columns: 1fr; }
  .sidebar { display: none; }
}
`;

/* ═══════════════════════════════ ICONS ══════════════════════════════════════ */
const Ic = ({ n, s = 16, c = "currentColor" }) => ({
  table:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="9" x2="9" y2="21"/></svg>,
  pdf:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  globe:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,
  edit:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  upload:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  check:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>,
  x:        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  alert:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  zap:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>,
  plus:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  chart:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  brain:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24A2.5 2.5 0 019.5 2zM14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.44 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-1.32-4.24A2.5 2.5 0 0014.5 2z"/></svg>,
  info:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  arrow:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>,
  bank:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12,2 20,7 4,7"/></svg>,
  star:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
  tag:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  news:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a4 4 0 01-4-4V6"/><line x1="10" y1="7" x2="16" y2="7"/><line x1="10" y1="11" x2="16" y2="11"/><line x1="10" y1="15" x2="12" y2="15"/></svg>,
  court:    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M3 6l9-4 9 4"/><line x1="12" y1="2" x2="12" y2="22"/><path d="M3 6v6c0 3.31 4.03 6 9 6s9-2.69 9-6V6"/></svg>,
  user:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  flag:     <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  map:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  refresh:  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><polyline points="23,4 23,10 17,10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  download: <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  shield:   <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  eye:      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
}[n] || null);

/* ═══════════════════════════════ MOCK DATA MODE ═════════════════════════════ */
async function callClaude(sys, user, max = 900) {
  // Demo mode: skip API calls and use mock data
  throw new Error("Mock mode - using fallback data");
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ═══════════════════════════════ STEP CONFIG ════════════════════════════════ */
const STEPS = [
  { id: 1, key: "login",      label: "Login" },
  { id: 2, key: "upload",     label: "Upload Data" },
  { id: 3, key: "analysis",   label: "AI Analysis" },
  { id: 4, key: "dashboard",  label: "Dashboard" },
  { id: 5, key: "summary",    label: "Summary" },
  { id: 6, key: "decision",   label: "Decision" },
  { id: 7, key: "cam",        label: "CAM Report" },
];

const INPUT_TABS = [
  { id: "structured", label: "Structured Data",    sub: "CSV · Excel · Database",        icon: "table",  color: C.cyan,   tag: "A" },
  { id: "documents",  label: "Unstructured Docs",  sub: "PDF · Reports · Legal Notices", icon: "pdf",    color: C.gold,   tag: "B" },
  { id: "external",   label: "External Intel",      sub: "News · MCA · Court · Web",      icon: "globe",  color: C.green,  tag: "C" },
  { id: "primary",    label: "Due Diligence Notes", sub: "Field Officer Observations",    icon: "edit",   color: C.violet, tag: "D" },
];

/* ═══════════════════════════════ DEFAULT DATA ═══════════════════════════════ */
const DEF = {
  companyName: "XYZ Manufacturing Pvt Ltd",
  sector: "Manufacturing",
  loanAmt: "5",
  promoter: "Rajesh Kumar",
  years: "8",
  revenue: "10",
  ebitda: "0.80",
  netProfit: "0.30",
  totalDebt: "2.5",
  gstSales: "10",
  bankCredits: "4",
  currentAssets: "3.5",
  currentLiabilities: "2.8",
  existingLoan: "2.5",
  netWorth: "3.2",
};

/* ═══════════════════════════════ MAIN APP ═══════════════════════════════════ */
export default function App() {
  const [step, setStep]           = useState(1);
  const [authUser, setAuthUser]   = useState(null);

  /* upload state */
  const [activeTab, setActiveTab] = useState("structured");
  const [tabDone, setTabDone]     = useState({ structured: false, documents: false, external: false, primary: false });

  /* A - structured */
  const [csvFile, setCsvFile]     = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows]     = useState([]);
  const [csvDrag, setCsvDrag]     = useState(false);
  const [fields, setFields]       = useState(DEF);

  /* B - documents */
  const [pdfFiles, setPdfFiles]   = useState([]);
  const [pdfDrag, setPdfDrag]     = useState(false);
  const [extractions, setExtractions] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [pdfPasteText, setPdfPasteText] = useState("");

  /* C - external */
  const [newsText, setNewsText]   = useState("Promoter Rajesh Kumar mentioned in ED inquiry linked to related group company ABC Holdings. Company sector (Manufacturing) facing import duty headwinds per latest DPIIT circular. Credit growth in SME segment slowing as per RBI data.");
  const [mcaText, setMcaText]     = useState("Company status: Active. One charge of ₹3.5 Cr created on factory premises in favour of Axis Bank Ltd (registered 2021). No winding-up petition filed. All directors DIN active. Annual returns filed for FY2023.");
  const [courtText, setCourtText] = useState("Case 1: Labour Court, Pune – ex-employee wrongful termination claim, hearing scheduled March 2026. Case 2: GSTIN Tribunal – mismatch notice FY2022-23, disputed amount ₹18 lakhs. No criminal proceedings.");
  const [promoterText, setPromoterText] = useState("Rajesh Kumar, age 48, B.Tech (Mech) IIT Bombay. 20+ years manufacturing experience. Directs 2 companies. ABC Holdings (related entity) under NPA classification with UCO Bank since Q3 2024. Personal net worth declared ₹8.2 Cr.");
  const [sentimentScore, setSentimentScore] = useState(null);
  const [analysing, setAnalysing] = useState({ news: false, mca: false, court: false, promoter: false });
  const [extResults, setExtResults] = useState({});

  /* D - primary notes */
  const [notes, setNotes]         = useState([
    { id: 1, cat: "Operations",     text: "Factory running at 40% capacity. Only 3 of 5 production lines operational.", severity: "high",   impact: "Reduced revenue generation; cash flow stress risk." },
    { id: 2, cat: "Management",     text: "CFO joined 3 months ago; succession planning unclear. MD actively engaged.", severity: "medium", impact: "Financial governance uncertainty; elevated operational risk." },
    { id: 3, cat: "Inventory",      text: "~4 months of raw material inventory pile-up observed in warehouse.", severity: "medium", impact: "Locked working capital; current ratio overstated." },
    { id: 4, cat: "Infrastructure", text: "Factory premises well-maintained. Land documents clear and unencumbered.", severity: "low",    impact: "Positive collateral signal; asset quality intact." },
  ]);
  const [noteForm, setNoteForm]   = useState({ cat: "Operations", text: "" });
  const [aiImpact, setAiImpact]   = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);

  /* analysis / result */
  const [logs, setLogs]           = useState([]);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult]       = useState(null);
  const [camText, setCamText]     = useState(null);

  /* ── derived ratios ── */
  const R = (() => {
    const f = fields;
    const rev = +f.revenue || 1, eb = +f.ebitda || 0, debt = +f.totalDebt || 1;
    const nw = +f.netWorth || 1, ca = +f.currentAssets || 0, cl = +f.currentLiabilities || 1;
    const gst = +f.gstSales || 1, bank = +f.bankCredits || 0;
    return {
      ebitdaM:   ((eb / rev) * 100).toFixed(1),
      de:        (debt / nw).toFixed(2),
      cr:        (ca / cl).toFixed(2),
      dscr:      (eb / (debt * 0.15)).toFixed(2),
      icr:       (eb / (debt * 0.12)).toFixed(2),
      mismatch:  (((gst - bank) / gst) * 100).toFixed(1),
      fraud:     ((gst - bank) / gst) > 0.30,
      lnw:       (+f.loanAmt / nw).toFixed(2),
    };
  })();

  /* ── CSV parse ── */
  const parseCsv = useCallback(file => {
    const rd = new FileReader();
    rd.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (json.length < 2) return;
        const h = json[0].map(String);
        const rows = json.slice(1).filter(r => r.some(v => v !== undefined && v !== ""));
        setCsvHeaders(h); setCsvRows(rows);
        setCsvFile({ name: file.name, size: file.size, rows: rows.length });
        // auto-map
        const row0 = Object.fromEntries(h.map((k, i) => [k.toLowerCase().replace(/[\s\-/]+/g, "_"), rows[0]?.[i]]));
        setFields(p => ({
          ...p,
          companyName: row0.company_name || row0.company || p.companyName,
          revenue: row0.revenue || row0.total_revenue || p.revenue,
          ebitda: row0.ebitda || p.ebitda,
          netProfit: row0.net_profit || row0.profit || p.netProfit,
          totalDebt: row0.total_debt || row0.debt || p.totalDebt,
          gstSales: row0.gst_sales || row0.gst || p.gstSales,
          bankCredits: row0.bank_credits || row0.bank || p.bankCredits,
          currentAssets: row0.current_assets || p.currentAssets,
          currentLiabilities: row0.current_liabilities || p.currentLiabilities,
          existingLoan: row0.existing_loan || p.existingLoan,
          netWorth: row0.net_worth || p.netWorth,
        }));
        setTabDone(d => ({ ...d, structured: true }));
      } catch {}
    };
    rd.readAsBinaryString(file);
  }, []);

  /* ── PDF extract via AI ── */
  const extractPdf = async (fileList) => {
    if (!fileList.length) return;
    setExtracting(true);
    const names = fileList.map(f => f.name).join(", ");
    const prompt = `You are a bank credit analyst. Based on these document names and context, simulate realistic risk extractions for a credit analyst reviewing ${fields.companyName} in ${fields.sector} sector.

Documents: ${names}
Additional text from officer: ${pdfPasteText || "N/A"}

Return ONLY valid JSON array (no fences):
[
  {"id":1,"doc":"filename","finding":"specific risk or positive finding","category":"Litigation|Financial|Regulatory|Auditor|Contingent|Operational","severity":"HIGH|MEDIUM|LOW","riskType":"flag|warn|ok"},
  ...
]
Return 6-8 realistic extractions.`;
    try {
      const raw = await callClaude("Credit document analyst. Return ONLY valid JSON array.", prompt, 700);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setExtractions(parsed);
      setTabDone(d => ({ ...d, documents: true }));
    } catch {
      setExtractions([
        { id: 1, doc: names.split(",")[0], finding: "Working capital stress mentioned due to delayed receivables", category: "Financial", severity: "HIGH", riskType: "flag" },
        { id: 2, doc: names.split(",")[0], finding: "Statutory auditor expressed going concern doubt conditionally", category: "Auditor", severity: "HIGH", riskType: "flag" },
        { id: 3, doc: names.split(",")[0], finding: "Tax dispute with GST authority — ₹18 lakhs contingent liability", category: "Litigation", severity: "MEDIUM", riskType: "warn" },
        { id: 4, doc: names.split(",")[0], finding: "Revenue grew 12% YoY but margins compressed by 2.1%", category: "Financial", severity: "MEDIUM", riskType: "warn" },
        { id: 5, doc: names.split(",")[0], finding: "No qualifications in secretarial audit report for current year", category: "Regulatory", severity: "LOW", riskType: "ok" },
        { id: 6, doc: names.split(",")[0], finding: "Contingent liabilities ₹2.3 Cr from ongoing labour disputes", category: "Contingent", severity: "MEDIUM", riskType: "warn" },
      ]);
      setTabDone(d => ({ ...d, documents: true }));
    }
    setExtracting(false);
  };

  /* ── External sentiment ── */
  const analyseExternal = async (type, text) => {
    setAnalysing(p => ({ ...p, [type]: true }));
    const labels = { news: "news article", mca: "MCA filing summary", court: "court case summary", promoter: "promoter background" };
    const prompt = `Analyse this ${labels[type]} for credit risk. Return ONLY valid JSON (no fences):
{"sentiment":"POSITIVE|NEUTRAL|NEGATIVE|ADVERSE","score":0-100,"findings":["finding1","finding2","finding3"],"risk_level":"LOW|MEDIUM|HIGH","summary":"one sentence"}
Text: ${text}`;
    try {
      const raw = await callClaude("Credit risk analyst. Return ONLY valid JSON.", prompt, 400);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setExtResults(p => ({ ...p, [type]: parsed }));
      if (type === "news") setSentimentScore(parsed.score);
      setTabDone(d => ({ ...d, external: true }));
    } catch {
      const fallback = { news: { sentiment: "ADVERSE", score: 72, findings: ["ED inquiry on promoter-linked entity", "Import duty headwinds for sector"], risk_level: "HIGH", summary: "Adverse promoter news detected with regulatory scrutiny." }, mca: { sentiment: "NEUTRAL", score: 45, findings: ["Existing charge on property", "All compliances filed"], risk_level: "MEDIUM", summary: "Active company with one existing charge registered." }, court: { sentiment: "NEUTRAL", score: 50, findings: ["Labour dispute pending", "GST mismatch notice"], risk_level: "MEDIUM", summary: "Two pending cases — moderate litigation exposure." }, promoter: { sentiment: "NEGATIVE", score: 68, findings: ["Related entity NPA with UCO Bank", "Strong industry experience"], risk_level: "HIGH", summary: "Elevated promoter risk due to related entity NPA classification." } };
      setExtResults(p => ({ ...p, [type]: fallback[type] }));
      if (type === "news") setSentimentScore(fallback[type].score);
      setTabDone(d => ({ ...d, external: true }));
    }
    setAnalysing(p => ({ ...p, [type]: false }));
  };

  /* ── AI impact for DD note ── */
  const getAiImpact = async (noteText) => {
    if (!noteText.trim()) return;
    setImpactLoading(true);
    const prompt = `A credit officer observes: "${noteText}"
    
Convert this to credit risk impact. Return ONLY valid JSON (no fences):
{"impact":"one sentence risk implication","severity":"HIGH|MEDIUM|LOW","risk_category":"Operational|Financial|Management|Collateral|Market","score_adjustment":"+5 to +25 risk points with reason"}`;
    try {
      const raw = await callClaude("Credit risk analyst.", prompt, 300);
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setAiImpact(parsed);
    } catch {
      setAiImpact({ impact: "Reduced operational capacity signals cash flow stress and elevated repayment risk.", severity: "HIGH", risk_category: "Operational", score_adjustment: "+18 risk points — capacity <50% threshold" });
    }
    setImpactLoading(false);
  };

  /* ── Add note ── */
  const addNote = async () => {
    if (!noteForm.text.trim()) return;
    const imp = aiImpact || { impact: "Pending AI analysis", severity: "MEDIUM", risk_category: "Operational", score_adjustment: "TBD" };
    setNotes(p => [...p, { id: Date.now(), cat: noteForm.cat, text: noteForm.text, severity: imp.severity?.toLowerCase() || "medium", impact: imp.impact }]);
    setNoteForm(p => ({ ...p, text: "" }));
    setAiImpact(null);
    setTabDone(d => ({ ...d, primary: true }));
  };

  /* ── Run full analysis ── */
  const addLog = (msg, type="info", det="", loading=false) => {
    const t = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setLogs(p => [...p, { msg, type, det, loading, t }]);
  };
  const updLog = (msg, type="info", det="") => {
    const t = new Date().toLocaleTimeString("en-IN", { hour12: false });
    setLogs(p => { const a=[...p]; a[a.length-1]={ msg, type, det, loading:false, t }; return a; });
  };

  const runAnalysis = async () => {
    setIsAnalysing(true); setLogs([]); setResult(null); setCamText(null);
    setStep(3);
    try {
      addLog("Ingesting structured financial data…", "info", `${csvFile?.name || "Manual"} · Revenue ₹${fields.revenue}Cr · EBITDA ₹${fields.ebitda}Cr`, true);
      await sleep(500);
      updLog("Structured data parsed · Ratios computed", "success", `EBITDA ${R.ebitdaM}% · D/E ${R.de}x · DSCR ${R.dscr}`);
      if (R.fraud) addLog("🚨 Fraud Detection: GST–Bank mismatch " + R.mismatch + "%", "warn", "Variance >30% → possible circular trading / fake invoicing");
      await sleep(300);

      addLog("NLP extraction from documents…", "info", `${pdfFiles.length} PDF(s) · ${extractions.length} findings`, true);
      await sleep(600);
      const highDocs = extractions.filter(e => e.riskType === "flag").length;
      updLog(`Document NLP complete · ${extractions.length} findings`, highDocs > 0 ? "warn" : "success", `${highDocs} HIGH risk items extracted`);
      await sleep(300);

      addLog("External intelligence analysis…", "info", "News sentiment · MCA · Court · Promoter profile", true);
      await sleep(600);
      const adverseCount = Object.values(extResults).filter(r => r?.risk_level === "HIGH").length;
      updLog(`External research complete · ${adverseCount} adverse signal(s)`, adverseCount > 0 ? "warn" : "success");
      await sleep(300);

      addLog("Processing field due diligence notes…", "info", `${notes.length} observations → risk conversion`, true);
      await sleep(400);
      const highNotes = notes.filter(n => n.severity === "high").length;
      updLog(`DD notes converted · ${highNotes} HIGH severity observations`, highNotes > 1 ? "warn" : "success");
      await sleep(300);

      addLog("Computing composite risk score (AI engine)…", "info", "47 parameters · Five Cs · Explainable AI", true);

      const extSummary = Object.entries(extResults).map(([k, v]) => `${k}: ${v?.summary || "N/A"} [${v?.risk_level || "?"}]`).join("; ");
      const docSummary = extractions.slice(0, 4).map(e => `[${e.severity}] ${e.finding}`).join("; ");
      const notesSummary = notes.map(n => `${n.cat}: ${n.text}`).join("; ");
      const cap = (notesSummary.match(/(\d+)%\s*capacity/i) || [])[1] || "65";

      const prompt = `Senior credit risk analyst. Score loan application 0-100 (higher=riskier). Return ONLY valid JSON.

STRUCTURED: Company=${fields.companyName}, Sector=${fields.sector}, Revenue=₹${fields.revenue}Cr, EBITDA=₹${fields.ebitda}Cr (${R.ebitdaM}%), NetProfit=₹${fields.netProfit}Cr, TotalDebt=₹${fields.totalDebt}Cr, NetWorth=₹${fields.netWorth}Cr, GST=₹${fields.gstSales}Cr, BankCredits=₹${fields.bankCredits}Cr, D/E=${R.de}, DSCR=${R.dscr}, CurrentRatio=${R.cr}, LoanRequested=₹${fields.loanAmt}Cr, FraudFlag=${R.fraud}, Mismatch=${R.mismatch}%
DOCS: ${docSummary || "No docs uploaded"}
EXTERNAL: ${extSummary || "Not analysed"}
FIELD: ${notesSummary}, CapacityUtilisation=${cap}%

Return:
{"overall":n,"character":n,"capacity":n,"capital":n,"collateral":n,"conditions":n,"fraud_risk":n,"litigation_risk":n,"promoter_risk":n,"industry_risk":n,"risks":["r1","r2","r3","r4"],"positives":["p1","p2","p3"],"decision":"APPROVE|CONDITIONAL_APPROVE|REJECT","amount":n,"rate":n,"tenure":"X years","covenants":["c1","c2","c3"],"rationale":"2-3 sentences","char_note":"...","cap_note":"...","cap2_note":"...","col_note":"...","cond_note":"...","summary":"4-5 sentence professional summary","trend":[{"m":"Jan","rev":0.75,"eb":0.06},{"m":"Feb","rev":0.82,"eb":0.07},{"m":"Mar","rev":0.91,"eb":0.08},{"m":"Apr","rev":0.78,"eb":0.05},{"m":"May","rev":0.88,"eb":0.07},{"m":"Jun","rev":0.86,"eb":0.06}],"segments":[{"name":"Domestic","value":65},{"name":"Export","value":22},{"name":"Govt","value":13}]}`;

      let res;
      try {
        const raw = await callClaude("Credit risk AI. Return ONLY valid JSON. No extra text.", prompt, 1000);
        res = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch {
        res = { overall:62,character:48,capacity:58,capital:55,collateral:42,conditions:52,fraud_risk:72,litigation_risk:55,promoter_risk:65,industry_risk:48,risks:["High GST–bank mismatch ("+R.mismatch+"%) — fraud risk elevated","Promoter ED inquiry on related group entity","Factory at "+cap+"% capacity — cash flow risk","Existing charge on collateral (Axis Bank)"],positives:["Collateral coverage ~1.4x loan amount","8 years operational history","Revenue growth 12% YoY"],decision:"CONDITIONAL_APPROVE",amount:3.5,rate:12.75,tenure:"5 years",covenants:["Quarterly DSCR monitoring ≥1.25","No further charge on collateral without bank NOC","Audited financials within 90 days of FY close"],rationale:"Conditional approval at ₹3.5Cr against requested ₹"+fields.loanAmt+"Cr due to elevated promoter risk and GST-bank mismatch. Collateral adequacy and business vintage provide partial comfort.",char_note:"Promoter under ED scrutiny; related entity NPA. Character risk HIGH.",cap_note:"DSCR "+R.dscr+"x; "+cap+"% utilisation compresses cash generation.",cap2_note:"D/E "+R.de+"x within acceptable range; net worth ₹"+fields.netWorth+"Cr adequate.",col_note:"Factory land ₹7Cr (est.); Axis Bank charge noted in MCA.",cond_note:"Sector headwinds from import duty; RBI tightening SME norms.",summary:fields.companyName+" is a "+fields.sector+" firm with "+fields.years+" years of operations requesting ₹"+fields.loanAmt+"Cr. Financial profile shows moderate leverage with DSCR "+R.dscr+"x but GST-bank mismatch of "+R.mismatch+"% raises authenticity concerns. Promoter background is a key risk given related entity NPA. Collateral of ₹7Cr provides 1.4x coverage. Conditional approval at reduced limit recommended with strict monitoring covenants.",trend:[{m:"Jan",rev:.75,eb:.06},{m:"Feb",rev:.82,eb:.07},{m:"Mar",rev:.91,eb:.08},{m:"Apr",rev:.78,eb:.05},{m:"May",rev:.88,eb:.07},{m:"Jun",rev:.86,eb:.06}],segments:[{name:"Domestic",value:65},{name:"Export",value:22},{name:"Govt",value:13}]};
      }

      updLog("Risk score: " + res.overall + "/100 · Decision: " + res.decision, "success");
      await sleep(400);

      addLog("Generating Credit Appraisal Memo…", "info", "10-section professional CAM", true);
      const camPr = `Write a formal bank Credit Appraisal Memo. Professional language. 10 numbered sections.
COMPANY: ${fields.companyName} | SECTOR: ${fields.sector} | LOAN: ₹${fields.loanAmt}Cr → ₹${res.amount}Cr @ ${res.rate}% for ${res.tenure}
DECISION: ${res.decision} | RISK: ${res.overall}/100
RATIOS: EBITDA ${R.ebitdaM}% | D/E ${R.de}x | DSCR ${res.dscr||R.dscr} | CR ${R.cr} | Mismatch ${R.mismatch}%
RISKS: ${res.risks?.join("; ")} | COVENANTS: ${res.covenants?.join("; ")}
Sections: 1.EXECUTIVE SUMMARY 2.BORROWER & PROMOTER PROFILE 3.FINANCIAL PERFORMANCE ANALYSIS 4.KEY FINANCIAL RATIOS 5.FRAUD & COMPLIANCE ASSESSMENT 6.RISK ANALYSIS — FIVE Cs 7.FIELD INVESTIGATION FINDINGS 8.INDUSTRY & MACRO CONDITIONS 9.RISK MITIGATION & COVENANTS 10.CREDIT DECISION & SANCTIONED TERMS`;
      let cam;
      try {
        cam = await callClaude("Senior bank credit officer.", camPr, 1000);
      } catch {
        cam = `CREDIT APPRAISAL MEMO (CAM) — DEMO VERSION\n\n1. EXECUTIVE SUMMARY\nConditional approval recommended for ₹${res.amount}Cr against requested ₹${fields.loanAmt}Cr. Risk score: ${res.overall}/100.\n\n2. BORROWER & PROMOTER PROFILE\n${fields.companyName}, ${fields.sector} sector, ${fields.years} years operational. Promoter: ${fields.promoter}.\n\n3. FINANCIAL PERFORMANCE\nRevenue: ₹${fields.revenue}Cr, EBITDA: ₹${fields.ebitda}Cr (${R.ebitdaM}%), Net Profit: ₹${fields.netProfit}Cr.\n\n4. KEY RATIOS\nD/E: ${R.de}x, DSCR: ${res.dscr||R.dscr}, Current Ratio: ${R.cr}\n\n5. FRAUD & COMPLIANCE\nGST/Bank mismatch: ${R.mismatch}% - Requires monitoring.\n\n6. FIVE Cs ANALYSIS\nCharacter (${res.character}), Capacity (${res.capacity}), Capital (${res.capital}), Collateral (${res.collateral}), Conditions (${res.conditions})\n\n7. FIELD FINDINGS\n${notes.map(n => `- ${n.cat}: ${n.text}`).join('\n')}\n\n8. MACRO CONDITIONS\n${fields.sector} sector facing import duty headwinds. SME credit growth slowing.\n\n9. COVENANTS\n${res.covenants?.map((c, i) => `${i+1}. ${c}`).join('\n')}\n\n10. DECISION\n${res.decision}: Approved amount ₹${res.amount}Cr @ ${res.rate}% for ${res.tenure}\n${res.rationale}`;
      }
      updLog("CAM generated — 10 sections complete", "success");
      await sleep(200);
      addLog("✅ All processing complete. Results ready.", "success");

      setResult(res); setCamText(cam); setIsAnalysing(false); setStep(4);
    } catch (err) {
      updLog("Error: " + err.message, "error");
      setIsAnalysing(false);
    }
  };

  const allDone = !!fields.companyName;
  const doneCount = Object.values(tabDone).filter(Boolean).length;

  /* ══════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>

      {/* bg layers */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:`linear-gradient(rgba(0,212,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.018) 1px,transparent 1px)`,
        backgroundSize:"52px 52px" }} />
      <div style={{ position:"fixed", width:600, height:600, borderRadius:"50%", background:`radial-gradient(circle,rgba(0,212,255,.05),transparent 70%)`, top:-200, right:-150, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:500, height:500, borderRadius:"50%", background:`radial-gradient(circle,rgba(155,127,255,.04),transparent 70%)`, bottom:-150, left:-100, pointerEvents:"none", zIndex:0 }} />

      {/* ─ STEP 1: LOGIN ─ */}
      {step === 1 && <LoginScreen onLogin={u => { setAuthUser(u); setStep(2); }} />}

      {/* ─ STEPS 2–7 ─ */}
      {step >= 2 && (
        <div style={{ position:"relative", zIndex:1, minHeight:"100vh", display:"flex", flexDirection:"column" }}>

          {/* Top progress bar */}
          <div className="top-bar">
            {/* logo */}
            <div style={{ display:"flex", alignItems:"center", gap:8, marginRight:24, flexShrink:0 }}>
              <div style={{ width:28, height:28, borderRadius:7, background:`linear-gradient(135deg,${C.cyan},#006688)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Ic n="bank" s={14} c="#05070F" />
              </div>
              <span style={{ fontFamily:"'Instrument Serif',serif", fontSize:16, fontWeight:700 }}>Intelli<span style={{color:C.cyan}}>Credit</span></span>
            </div>

            <div style={{ flex:1, display:"flex", alignItems:"center", gap:0, maxWidth:760 }}>
              {STEPS.map((s, i) => (
                <div key={s.id} style={{ display:"flex", alignItems:"center", flex: i<STEPS.length-1 ? 1 : "none" }}>
                  <div className="snode" onClick={() => result && setStep(s.id)} style={{ cursor: result ? "pointer" : "default" }}>
                    <div className={`scirc ${step > s.id ? "done" : step === s.id ? "active" : "pend"}`}>
                      {step > s.id ? <Ic n="check" s={12} c="#05070F" /> : s.id}
                    </div>
                    <span className="slbl" style={{ color: step === s.id ? C.cyan : step > s.id ? C.green : C.muted }}>{s.label}</span>
                  </div>
                  {i < STEPS.length-1 && (
                    <div className="sline" style={{ background: step > s.id+1 ? C.green : step >= s.id+1 ? C.cyan : C.border }} />
                  )}
                </div>
              ))}
            </div>

            {authUser && (
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8, fontSize:14, color:C.sub, flexShrink:0 }}>
                <Ic n="user" s={13} c={C.muted} />
                <span style={{ color:C.text, fontWeight:600 }}>{authUser}</span>
              </div>
            )}
          </div>

          {/* ─ STEP 2: UPLOAD ─ */}
          {step === 2 && (
            <div className="shell" style={{ flex:1 }}>
              {/* Sidebar */}
              <aside className="sidebar">
                <div style={{ padding:"20px 18px 12px" }}>
                  <div style={{ fontSize:14, color:C.sub, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", marginBottom:4 }}>Input Sources</div>
                  <div style={{ fontSize:14, color:C.sub }}>Complete all 4 types for best accuracy</div>
                </div>

                {INPUT_TABS.map(tab => (
                  <button key={tab.id} className={`tab-item${activeTab===tab.id?" active":""}${tabDone[tab.id]?" done":""}`}
                    onClick={() => setActiveTab(tab.id)}>
                    <div className="tab-badge" style={{
                      background: activeTab===tab.id ? `${tab.color}22` : tabDone[tab.id] ? C.greenDim : C.lift,
                      border: `1px solid ${activeTab===tab.id ? tab.color+"44" : tabDone[tab.id] ? C.green+"44" : C.border}`,
                      color: activeTab===tab.id ? tab.color : tabDone[tab.id] ? C.green : C.sub,
                    }}>
                      {tabDone[tab.id] ? <Ic n="check" s={13} c={C.green} /> : tab.tag}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600, color: activeTab===tab.id ? C.text : tabDone[tab.id] ? C.sub : C.sub }}>{tab.label}</div>
                      <div style={{ fontSize:14, color:C.sub, marginTop:2 }}>{tab.sub}</div>
                    </div>
                  </button>
                ))}

                {/* Progress */}
                <div style={{ padding:"16px 18px", marginTop:"auto", borderTop:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:14, color:C.sub, fontWeight:700, letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>
                    Completion — {doneCount}/4
                  </div>
                  <div style={{ height:4, background:C.border, borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", background:`linear-gradient(90deg,${C.cyan},${C.green})`, borderRadius:2, width:`${doneCount/4*100}%`, transition:"width .5s ease" }} />
                  </div>
                  <div style={{ marginTop:12 }}>
                    <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", padding:"12px", fontSize:14 }}
                      disabled={isAnalysing} onClick={runAnalysis}>
                      {isAnalysing
                        ? <><div className="spin" style={{ borderTopColor:"#05070F" }} /> Analysing…</>
                        : <><Ic n="zap" s={15} c="#05070F" /> Run AI Analysis</>}
                    </button>
                  </div>
                  {!fields.companyName && <div style={{ fontSize:14, color:C.muted, marginTop:6, textAlign:"center" }}>Enter company name to proceed</div>}
                </div>
              </aside>

              {/* Main panel */}
              <main style={{ padding:"28px 28px 60px", overflowY:"auto", minHeight:0 }}>

                {/* ── TAB A: STRUCTURED ── */}
                {activeTab === "structured" && (
                  <div className="fu">
                    <TabHeader letter="A" color={C.cyan} title="Structured Financial Data" sub="Upload CSV / Excel file or enter values manually. Used for ratio calculation, fraud detection, and ML scoring." />

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>

                      {/* Upload card */}
                      <div className="card" style={{ borderColor:"rgba(0,212,255,.18)" }}>
                        <div className="card-head"><Ic n="upload" s={15} c={C.cyan} /><span style={{ fontSize:14, fontWeight:700, color:C.cyan }}>File Upload</span><span className="tag t-cyan" style={{ marginLeft:"auto" }}>CSV · XLSX · XLS</span></div>
                        <div className="card-body">
                          <div className={`dropzone${csvDrag?" over":""}${csvFile?" done":""}`}
                            onDragOver={e => { e.preventDefault(); setCsvDrag(true); }}
                            onDragLeave={() => setCsvDrag(false)}
                            onDrop={e => { e.preventDefault(); setCsvDrag(false); const f=e.dataTransfer.files[0]; if(f) parseCsv(f); }}
                            onClick={() => document.getElementById("csv-inp").click()}>
                            <input id="csv-inp" type="file" accept=".csv,.xlsx,.xls" style={{ display:"none" }} onChange={e => e.target.files[0] && parseCsv(e.target.files[0])} />
                            {csvFile ? (
                              <>
                                <Ic n="check" s={36} c={C.green} />
                                <div style={{ marginTop:10, fontSize:14, fontWeight:700, color:C.green }}>{csvFile.name}</div>
                                <div style={{ fontSize:14, color:C.sub, marginTop:4 }}>{csvFile.rows} rows · {(csvFile.size/1024).toFixed(0)} KB</div>
                              </>
                            ) : (
                              <>
                                <Ic n="upload" s={36} c={C.muted} />
                                <div style={{ marginTop:12, fontSize:14, fontWeight:700 }}>Drag & Drop or Click</div>
                                <div style={{ fontSize:14, color:C.sub, marginTop:4 }}>Revenue · EBITDA · GST · Bank Credits · Debt · Assets</div>
                                <div className="tag t-cyan" style={{ marginTop:10 }}>Supports CSV, Excel .xlsx/.xls</div>
                              </>
                            )}
                          </div>

                          {csvHeaders.length > 0 && (
                            <div style={{ marginTop:14 }}>
                              <div className="sec-lbl">Detected Columns ({csvHeaders.length})</div>
                              <div style={{ overflowX:"auto", border:`1px solid ${C.border}`, borderRadius:9, maxHeight:160, overflowY:"auto" }}>
                                <table className="tbl">
                                  <thead><tr>{csvHeaders.slice(0,6).map(h => <th key={h}>{h}</th>)}</tr></thead>
                                  <tbody>
                                    {csvRows.slice(0,4).map((row,i) => (
                                      <tr key={i}>{csvHeaders.slice(0,6).map((_,j) => <td key={j}>{row[j] ?? "—"}</td>)}</tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              {csvRows.length > 4 && <div style={{ fontSize:13, color:C.sub, textAlign:"center", marginTop:4 }}>+ {csvRows.length-4} more rows</div>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Manual fields */}
                      <div className="card">
                        <div className="card-head"><Ic n="edit" s={15} c={C.sub} /><span style={{ fontSize:14, fontWeight:700 }}>Manual Entry / Override</span></div>
                        <div className="card-body" style={{ maxHeight:360, overflowY:"auto" }}>
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                            {[
                              ["companyName","Company Name",true],["sector","Sector"],["loanAmt","Loan Requested (₹ Cr)"],
                              ["promoter","Promoter Name"],["years","Years in Operation"],["revenue","Revenue (₹ Cr)"],
                              ["ebitda","EBITDA (₹ Cr)"],["netProfit","Net Profit (₹ Cr)"],["totalDebt","Total Debt (₹ Cr)"],
                              ["netWorth","Net Worth (₹ Cr)"],["gstSales","GST Sales (₹ Cr)"],["bankCredits","Bank Credits (₹ Cr)"],
                              ["currentAssets","Current Assets (₹ Cr)"],["currentLiabilities","Current Liabilities (₹ Cr)"],
                              ["existingLoan","Existing Loan (₹ Cr)"],
                            ].map(([k,l,full]) => (
                              <div key={k} style={{ gridColumn: full?"1/-1":"auto" }}>
                                <label className="lbl">{l}</label>
                                <input className="inp" value={fields[k]||""} onChange={e => { setFields(p=>({...p,[k]:e.target.value})); setTabDone(d=>({...d,structured:true})); }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Live ratio dashboard */}
                    <div className="card">
                      <div className="card-head"><Ic n="chart" s={15} c={C.gold} /><span style={{ fontSize:14, fontWeight:700, color:C.gold }}>Live Financial Ratios</span><span style={{ fontSize:14, color:C.sub, marginLeft:"auto" }}>Updates as you type</span></div>
                      <div className="card-body">
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
                          {[
                            { l:"EBITDA Margin", v:`${R.ebitdaM}%`, ok:+R.ebitdaM>8, bench:">8%" },
                            { l:"Debt / Equity", v:`${R.de}x`, ok:+R.de<2, bench:"<2x" },
                            { l:"Current Ratio", v:R.cr, ok:+R.cr>1.2, bench:">1.2" },
                            { l:"DSCR", v:R.dscr, ok:+R.dscr>1.25, bench:">1.25" },
                            { l:"Interest Cover", v:`${R.icr}x`, ok:+R.icr>2, bench:">2x" },
                            { l:"Loan / Net Worth", v:`${R.lnw}x`, ok:+R.lnw<2, bench:"<2x" },
                            { l:"GST–Bank Var.", v:`${R.mismatch}%`, ok:!R.fraud, bench:"<30%" },
                            { l:"Fraud Signal", v:R.fraud?"⚠️ HIGH":"✓ CLEAR", ok:!R.fraud, bench:"None" },
                          ].map(m => (
                            <div key={m.l} className="ratio-chip" style={{ borderColor: m.ok?"rgba(0,229,160,.2)":"rgba(255,59,96,.2)" }}>
                              <div style={{ fontSize:14, fontWeight:800, color:C.sub, letterSpacing:.5, textTransform:"uppercase" }}>{m.l}</div>
                              <div className="ratio-v" style={{ color:m.ok?C.green:C.red }}>{m.v}</div>
                              <div style={{ fontSize:14, color:C.sub, marginTop:2 }}>Bench: {m.bench}</div>
                            </div>
                          ))}
                        </div>
                        {R.fraud && (
                          <div style={{ padding:"12px 16px", background:C.redDim, border:`1px solid rgba(255,59,96,.3)`, borderRadius:9, display:"flex", gap:10, alignItems:"flex-start" }}>
                            <Ic n="alert" s={16} c={C.red} />
                            <div>
                              <div style={{ fontSize:14, fontWeight:700, color:C.red }}>🚨 Fraud Detection Alert — GST–Bank Mismatch</div>
                              <div style={{ fontSize:14, color:"#9AAAC8", marginTop:3, lineHeight:1.5 }}>GST Sales ₹{fields.gstSales}Cr vs Bank Credits ₹{fields.bankCredits}Cr = {R.mismatch}% variance (threshold: 30%). This pattern is consistent with circular trading or fake invoicing. Manual verification strongly recommended.</div>
                            </div>
                          </div>
                        )}

                        {/* Mini bar chart of key ratios */}
                        <div style={{ marginTop:14 }}>
                          <div className="sec-lbl">Ratio Score vs Benchmark</div>
                          <ResponsiveContainer width="100%" height={100}>
                            <BarChart data={[
                              { name:"EBITDA%", score:Math.min(+R.ebitdaM,25), bench:8 },
                              { name:"D/E",     score:Math.min(+R.de*25,50),   bench:50 },
                              { name:"DSCR",    score:Math.min(+R.dscr*50,100), bench:62.5 },
                              { name:"CR",      score:Math.min(+R.cr*50,100),  bench:60 },
                            ]} barCategoryGap="30%">
                              <XAxis dataKey="name" tick={{ fill:C.text, fontSize:14 }} axisLine={false} tickLine={false} />
                              <YAxis hide domain={[0,100]} />
                              <Tooltip contentStyle={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, fontSize:14 }} />
                              <Bar dataKey="score" fill={C.cyan} radius={3} opacity={0.8} name="Actual" />
                              <Bar dataKey="bench" fill={C.border} radius={3} name="Benchmark" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB B: DOCUMENTS ── */}
                {activeTab === "documents" && (
                  <div className="fu">
                    <TabHeader letter="B" color={C.gold} title="Unstructured Documents" sub="Upload PDF annual reports, legal notices, financial statements, rating agency reports. AI extracts risk statements, litigation mentions, auditor remarks and contingent liabilities." />

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>

                      {/* Upload zone */}
                      <div className="card" style={{ borderColor:"rgba(255,187,0,.18)" }}>
                        <div className="card-head"><Ic n="pdf" s={15} c={C.gold} /><span style={{ fontSize:14, fontWeight:700, color:C.gold }}>PDF Upload</span><span className="tag t-gold" style={{ marginLeft:"auto" }}>Multi-file</span></div>
                        <div className="card-body">
                          <div className={`dropzone gold${pdfDrag?" over":""}`}
                            onDragOver={e => { e.preventDefault(); setPdfDrag(true); }}
                            onDragLeave={() => setPdfDrag(false)}
                            onDrop={e => {
                              e.preventDefault(); setPdfDrag(false);
                              const files = Array.from(e.dataTransfer.files);
                              setPdfFiles(p => [...p, ...files.map(f => ({ name:f.name, size:f.size }))]);
                            }}
                            onClick={() => document.getElementById("pdf-inp").click()}>
                            <input id="pdf-inp" type="file" accept=".pdf,.txt,.doc" multiple style={{ display:"none" }}
                              onChange={e => {
                                const files = Array.from(e.target.files);
                                setPdfFiles(p => [...p, ...files.map(f => ({ name:f.name, size:f.size }))]);
                              }} />
                            <Ic n="pdf" s={36} c={pdfFiles.length > 0 ? C.gold : C.muted} />
                            <div style={{ marginTop:12, fontSize:14, fontWeight:700 }}>Drop PDFs here</div>
                            <div style={{ fontSize:14, color:C.sub, marginTop:4 }}>Annual Reports · Financial Statements · Legal Notices · Rating Reports</div>
                            {pdfFiles.length > 0 && <div className="tag t-gold" style={{ marginTop:10 }}>{pdfFiles.length} file(s) queued</div>}
                          </div>

                          {pdfFiles.length > 0 && (
                            <div style={{ marginTop:14 }}>
                              {pdfFiles.map((f,i) => (
                                <div key={i} className="file-chip" style={{ animationDelay:`${i*.05}s` }}>
                                  <Ic n="pdf" s={14} c={C.gold} />
                                  <span className="fc-name">{f.name}</span>
                                  <span className="fc-size">{(f.size/1024).toFixed(0)}KB</span>
                                  <button className="fc-rm" onClick={() => setPdfFiles(p => p.filter((_,j)=>j!==i))}><Ic n="x" s={13} /></button>
                                </div>
                              ))}
                              <button className="btn btn-outline" style={{ width:"100%", justifyContent:"center", marginTop:10, borderColor:"rgba(255,187,0,.35)", color:C.gold }}
                                disabled={extracting} onClick={() => extractPdf(pdfFiles)}>
                                {extracting ? <><div className="spin" /> Extracting…</> : <><Ic n="brain" s={14} c={C.gold} /> Extract Risk Findings</>}
                              </button>
                            </div>
                          )}

                          <div style={{ marginTop:14 }}>
                            <label className="lbl">Paste Document Excerpts (Optional)</label>
                            <textarea className="inp" placeholder="Paste key excerpts from annual report, auditor notes, legal notices…"
                              value={pdfPasteText} onChange={e => setPdfPasteText(e.target.value)} />
                            {!pdfFiles.length && pdfPasteText && (
                              <button className="btn btn-outline" style={{ marginTop:8, width:"100%", justifyContent:"center", borderColor:"rgba(255,187,0,.35)", color:C.gold }}
                                disabled={extracting} onClick={() => extractPdf([{ name:"Pasted text" }])}>
                                {extracting ? <><div className="spin" /> Extracting…</> : <><Ic n="brain" s={14} c={C.gold} /> Analyse Text</>}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* What AI looks for */}
                      <div className="card">
                        <div className="card-head"><Ic n="eye" s={15} c={C.sub} /><span style={{ fontSize:14, fontWeight:700 }}>What AI Extracts</span></div>
                        <div className="card-body">
                          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                            {[
                              { cat:"Financial Risk", example:'"Working capital stress due to delayed receivables"', flag:"Liquidity Risk", color:C.red },
                              { cat:"Litigation",     example:'"Company involved in tax dispute with GST authority"',  flag:"Legal Risk",     color:C.red },
                              { cat:"Auditor Remark", example:'"Going concern doubt expressed by statutory auditor"',  flag:"HIGH Risk",      color:C.red },
                              { cat:"Contingent Liab",example:'"₹2.3 Cr contingent on outcome of labour cases"',       flag:"Off-Balance Sheet",color:C.orange },
                              { cat:"Regulatory",     example:'"NOC pending from State Pollution Control Board"',       flag:"Compliance Risk",color:C.orange },
                              { cat:"Positive",       example:'"No qualifications in secretarial audit report"',        flag:"✓ Clean Signal", color:C.green },
                            ].map((item,i) => (
                              <div key={i} style={{ padding:"10px 12px", background:C.lift, border:`1px solid ${C.border}`, borderRadius:9, animationDelay:`${i*.06}s` }} className="pi">
                                <div style={{ fontSize:14, fontWeight:800, color:item.color, textTransform:"uppercase", letterSpacing:.8, marginBottom:4 }}>{item.cat}</div>
                                <div style={{ fontSize:14, color:C.sub, fontStyle:"italic", marginBottom:5 }}>{item.example}</div>
                                <span className={`tag ${item.color===C.red?"t-red":item.color===C.orange?"t-orange":"t-green"}`}>→ {item.flag}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Extraction results */}
                    {extractions.length > 0 && (
                      <div className="card scan-wrap" style={{ borderColor:"rgba(255,187,0,.18)" }}>
                        <div className="card-head">
                          <Ic n="tag" s={15} c={C.gold} />
                          <span style={{ fontSize:14, fontWeight:700, color:C.gold }}>AI Extraction Results</span>
                          <span style={{ fontSize:14, color:C.sub, marginLeft:8 }}>{extractions.length} findings</span>
                          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
                            <span className="tag t-red">{extractions.filter(e=>e.riskType==="flag").length} HIGH</span>
                            <span className="tag t-orange">{extractions.filter(e=>e.riskType==="warn").length} MED</span>
                            <span className="tag t-green">{extractions.filter(e=>e.riskType==="ok").length} LOW</span>
                          </div>
                        </div>
                        <div className="card-body">
                          {extractions.map((e,i) => (
                            <div key={e.id} className={`extract-card ${e.riskType}`} style={{ animationDelay:`${i*.05}s` }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:5 }}>
                                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                                  <span className={`tag ${e.riskType==="flag"?"t-red":e.riskType==="warn"?"t-orange":"t-green"}`}>{e.severity}</span>
                                  <span className="tag t-violet" style={{ fontSize:8 }}>{e.category}</span>
                                </div>
                                <span style={{ fontSize:13, color:C.sub }}>{e.doc}</span>
                              </div>
                              <div style={{ fontSize:14, color:C.text, lineHeight:1.5 }}>{e.finding}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB C: EXTERNAL INTEL ── */}
                {activeTab === "external" && (
                  <div className="fu">
                    <TabHeader letter="C" color={C.green} title="External Intelligence" sub="Provide news articles, MCA filing summaries, court case details and promoter background. AI performs sentiment analysis, litigation detection and promoter risk scoring." />

                    {/* Sentiment meter */}
                    {sentimentScore !== null && (
                      <div className="card" style={{ marginBottom:18, borderColor:"rgba(0,229,160,.18)" }}>
                        <div className="card-body">
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                            <span style={{ fontSize:14, fontWeight:700 }}>Overall External Sentiment Score</span>
                            <span style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:500, color: sentimentScore>60?C.red:sentimentScore>35?C.orange:C.green }}>{sentimentScore}/100</span>
                          </div>
                          <div style={{ position:"relative" }}>
                            <div className="sent-bar" style={{ height:10, borderRadius:5 }} />
                            <div className="sent-cursor" style={{ left:`${sentimentScore}%`, top:-1, width:12, height:12 }} />
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", marginTop:6, fontSize:14, color:C.sub }}>
                            <span>LOW RISK</span><span>MODERATE</span><span>HIGH RISK</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                      {[
                        { key:"news",     label:"News & Web Intelligence", icon:"news",   color:C.green,  placeholder:"Paste news articles, sector reports, RBI circulars, web alerts about company or promoter…",          val:newsText, set:setNewsText },
                        { key:"mca",      label:"MCA / ROC Filing Summary", icon:"shield", color:C.cyan,   placeholder:"Company status, director DIN, charge creations, winding-up petitions, annual return status…",       val:mcaText,  set:setMcaText },
                        { key:"court",    label:"Court Case Summary",        icon:"court",  color:C.orange, placeholder:"Pending cases, arbitration proceedings, judgments, GST disputes, labour cases, IBC filings…",       val:courtText,set:setCourtText },
                        { key:"promoter", label:"Promoter Background",        icon:"user",   color:C.violet, placeholder:"Education, experience, other business interests, personal net worth, related entity NPA status…", val:promoterText, set:setPromoterText },
                      ].map(item => (
                        <div key={item.key} className="card">
                          <div className="card-head">
                            <Ic n={item.icon} s={15} c={item.color} />
                            <span style={{ fontSize:14, fontWeight:700, color:item.color }}>{item.label}</span>
                            {extResults[item.key] && (
                              <span className={`tag ${extResults[item.key].risk_level==="HIGH"?"t-red":extResults[item.key].risk_level==="MEDIUM"?"t-orange":"t-green"}`} style={{ marginLeft:"auto" }}>
                                {extResults[item.key].risk_level}
                              </span>
                            )}
                          </div>
                          <div className="card-body">
                            <div style={{ fontSize:13, color:C.text, padding:"8px 11px", background:C.lift, borderRadius:7, marginBottom:10 }}>
                              💡 AI performs: sentiment analysis · risk detection · {item.key === "promoter" ? "character scoring" : item.key === "court" ? "litigation severity" : item.key === "mca" ? "compliance check" : "threat identification"}
                            </div>
                            <textarea className="inp" placeholder={item.placeholder} value={item.val} onChange={e => item.set(e.target.value)} />
                            <button className="btn btn-ghost" style={{ marginTop:8, width:"100%", justifyContent:"center", fontSize:14, borderColor:`${item.color}30`, color:item.color }}
                              disabled={analysing[item.key] || !item.val.trim()} onClick={() => analyseExternal(item.key, item.val)}>
                              {analysing[item.key] ? <><div className="spin" style={{ borderTopColor:item.color }} /> Analysing…</> : <><Ic n="brain" s={13} c={item.color} /> Analyse with AI</>}
                            </button>

                            {/* Result panel */}
                            {extResults[item.key] && (
                              <div style={{ marginTop:12, padding:"12px 14px", background:C.lift, border:`1px solid ${C.border}`, borderRadius:9 }} className="pi">
                                <div style={{ fontSize:14, fontWeight:700, color: extResults[item.key].risk_level==="HIGH"?C.red:extResults[item.key].risk_level==="MEDIUM"?C.orange:C.green, marginBottom:6 }}>
                                  {extResults[item.key].sentiment} · {extResults[item.key].risk_level} RISK
                                </div>
                                <div style={{ fontSize:14, color:C.sub, marginBottom:8, lineHeight:1.5 }}>{extResults[item.key].summary}</div>
                                {extResults[item.key].findings?.map((f,i) => (
                                  <div key={i} style={{ display:"flex", gap:8, fontSize:14, color:"#8A9BBC", padding:"4px 0", borderTop:i>0?`1px solid ${C.border}`:"none" }}>
                                    <span style={{ color:extResults[item.key].risk_level==="LOW"?C.green:C.orange, flexShrink:0 }}>•</span>
                                    {f}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── TAB D: PRIMARY DD NOTES ── */}
                {activeTab === "primary" && (
                  <div className="fu">
                    <TabHeader letter="D" color={C.violet} title="Primary Due Diligence Notes" sub="Credit officer enters field observations. AI converts each note into a quantified risk impact and adjusts the overall credit score accordingly." />

                    <div style={{ display:"grid", gridTemplateColumns:"3fr 2fr", gap:18 }}>

                      {/* Left: note entry + list */}
                      <div>
                        {/* Add note */}
                        <div className="card" style={{ borderColor:"rgba(155,127,255,.18)", marginBottom:18 }}>
                          <div className="card-head"><Ic n="plus" s={15} c={C.violet} /><span style={{ fontSize:14, fontWeight:700, color:C.violet }}>Add Observation</span></div>
                          <div className="card-body">
                            <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:10, marginBottom:10 }}>
                              <div>
                                <label className="lbl">Category</label>
                                <select className="inp" style={{ minWidth:130 }} value={noteForm.cat} onChange={e => setNoteForm(p => ({...p, cat:e.target.value}))}>
                                  {["Operations","Management","Inventory","Infrastructure","Market","Legal","Financial"].map(c => <option key={c}>{c}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="lbl">Observation</label>
                                <input className="inp" placeholder='e.g. "Factory running at 40% capacity"'
                                  value={noteForm.text} onChange={e => { setNoteForm(p=>({...p,text:e.target.value})); setAiImpact(null); }}
                                  onKeyDown={e => e.key==="Enter" && noteForm.text && addNote()} />
                              </div>
                            </div>

                            <div style={{ display:"flex", gap:8 }}>
                              <button className="btn btn-ghost" style={{ fontSize:14, borderColor:"rgba(155,127,255,.3)", color:C.violet }}
                                disabled={!noteForm.text.trim() || impactLoading} onClick={() => getAiImpact(noteForm.text)}>
                                {impactLoading ? <><div className="spin" style={{ borderTopColor:C.violet }} /> Analysing…</> : <><Ic n="brain" s={13} c={C.violet} /> Get AI Impact</>}
                              </button>
                              <button className="btn btn-outline" style={{ borderColor:"rgba(155,127,255,.35)", color:C.violet }}
                                disabled={!noteForm.text.trim()} onClick={addNote}>
                                <Ic n="plus" s={14} c={C.violet} /> Add Note
                              </button>
                            </div>

                            {/* AI impact result */}
                            {aiImpact && (
                              <div className="pi" style={{ marginTop:12, padding:"12px 14px", background:C.violetDim, border:`1px solid rgba(155,127,255,.3)`, borderRadius:9 }}>
                                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                                  <Ic n="brain" s={14} c={C.violet} />
                                  <span style={{ fontSize:14, fontWeight:700, color:C.violet }}>AI Risk Impact</span>
                                  <span className={`tag ${aiImpact.severity==="HIGH"?"t-red":aiImpact.severity==="MEDIUM"?"t-orange":"t-green"}`}>{aiImpact.severity}</span>
                                  <span className="tag t-violet">{aiImpact.risk_category}</span>
                                </div>
                                <div style={{ fontSize:14, color:C.text, lineHeight:1.5, marginBottom:6 }}>{aiImpact.impact}</div>
                                <div style={{ fontSize:14, color:C.sub }}>Score adjustment: <span style={{ color:C.orange, fontFamily:"'DM Mono',monospace" }}>{aiImpact.score_adjustment}</span></div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Notes list */}
                        <div className="card">
                          <div className="card-head">
                            <Ic n="flag" s={15} c={C.violet} />
                            <span style={{ fontSize:14, fontWeight:700 }}>Filed Observations ({notes.length})</span>
                            <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
                              <span className="tag t-red">{notes.filter(n=>n.severity==="high").length} High</span>
                              <span className="tag t-orange">{notes.filter(n=>n.severity==="medium").length} Med</span>
                              <span className="tag t-green">{notes.filter(n=>n.severity==="low").length} Low</span>
                            </div>
                          </div>
                          <div className="card-body">
                            {notes.map((note,i) => (
                              <div key={note.id} className="note-chip" style={{ animationDelay:`${i*.05}s`, borderColor: note.severity==="high"?"rgba(255,59,96,.25)":note.severity==="medium"?"rgba(255,138,48,.25)":"rgba(0,229,160,.25)" }}>
                                <div style={{ width:8, height:8, borderRadius:"50%", background: note.severity==="high"?C.red:note.severity==="medium"?C.orange:C.green, flexShrink:0, marginTop:4 }} />
                                <div style={{ flex:1, minWidth:0 }}>
                                  <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:4 }}>
                                    <span className="tag t-violet" style={{ fontSize:8 }}>{note.cat}</span>
                                    <span className={`tag ${note.severity==="high"?"t-red":note.severity==="medium"?"t-orange":"t-green"}`} style={{ fontSize:8 }}>{note.severity.toUpperCase()}</span>
                                  </div>
                                  <div style={{ fontSize:14, color:C.text, lineHeight:1.5 }}>{note.text}</div>
                                  {note.impact && <div style={{ fontSize:14, color:C.sub, marginTop:4, fontStyle:"italic" }}>→ {note.impact}</div>}
                                </div>
                                <button style={{ background:"none", border:"none", cursor:"pointer", color:C.muted, flexShrink:0 }}
                                  onClick={() => setNotes(p => p.filter(n => n.id !== note.id))}>
                                  <Ic n="trash" s={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: conversion explainer + stats */}
                      <div>
                        <div className="card" style={{ marginBottom:18 }}>
                          <div className="card-head"><Ic n="info" s={15} c={C.violet} /><span style={{ fontSize:14, fontWeight:700 }}>How AI Converts Notes</span></div>
                          <div className="card-body">
                            {[
                              { note:'"40% capacity"',      arrow:"→ Cash flow stress; DSCR impact ↓",         color:C.red },
                              { note:'"CFO joined 3 months"', arrow:"→ Management stability risk +12pts",        color:C.orange },
                              { note:'"Inventory pile-up"', arrow:"→ Working capital locked; CR overstated",    color:C.orange },
                              { note:'"Land docs clear"',   arrow:"→ Collateral quality ↑; charge risk ↓",      color:C.green },
                              { note:'"MD engaged"',        arrow:"→ Positive management signal –5pts",          color:C.green },
                            ].map((ex,i) => (
                              <div key={i} style={{ padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
                                <div style={{ fontSize:14, color:C.violet, fontFamily:"'DM Mono',monospace", marginBottom:3 }}>{ex.note}</div>
                                <div style={{ fontSize:14, color:ex.color }}>{ex.arrow}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Severity chart */}
                        <div className="card">
                          <div className="card-head"><Ic n="chart" s={14} c={C.sub} /><span style={{ fontSize:14, fontWeight:700 }}>Severity Distribution</span></div>
                          <div className="card-body">
                            <ResponsiveContainer width="100%" height={120}>
                              <BarChart data={[
                                { name:"High",   count:notes.filter(n=>n.severity==="high").length,   fill:C.red },
                                { name:"Medium", count:notes.filter(n=>n.severity==="medium").length, fill:C.orange },
                                { name:"Low",    count:notes.filter(n=>n.severity==="low").length,    fill:C.green },
                              ]}>
                                <XAxis dataKey="name" tick={{ fill:C.text, fontSize:14 }} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, fontSize:14 }} />
                                <Bar dataKey="count" radius={5}>
                                  {["high","medium","low"].map((s,i) => (
                                    <Cell key={i} fill={[C.red, C.orange, C.green][i]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>

                            {/* Category coverage */}
                            <div style={{ marginTop:12 }}>
                              <div className="sec-lbl">Category Coverage</div>
                              {["Operations","Management","Inventory","Infrastructure","Market","Legal"].map(cat => {
                                const has = notes.some(n => n.cat === cat);
                                return (
                                  <div key={cat} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", fontSize:14 }}>
                                    <div style={{ width:6, height:6, borderRadius:"50%", background: has ? C.green : C.border, flexShrink:0 }} />
                                    <span style={{ color: has ? C.text : C.muted }}>{cat}</span>
                                    {has && <span className="tag t-green" style={{ fontSize:8, marginLeft:"auto" }}>✓</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </main>
            </div>
          )}

          {/* ─ STEP 3: ANALYSIS ─ */}
          {step === 3 && (
            <div style={{ position:"relative", zIndex:1, padding:"36px 32px", maxWidth:860, margin:"0 auto", width:"100%" }} className="fu">
              <div style={{ marginBottom:24 }}>
                <div style={{ fontSize:14, color:C.sub, letterSpacing:1.8, textTransform:"uppercase", marginBottom:6 }}>Step 3 of 7</div>
                <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:34, fontWeight:400 }}>AI Analysis Engine</h1>
                <p style={{ color:C.text, fontSize:14, marginTop:4 }}>Processing all 4 input sources through the credit intelligence pipeline</p>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
                {[
                  { l:"Data Ingestor",   d:"Ratios · Fraud detection",  ic:"table", col:C.cyan,   done: logs.filter(l=>l.type==="success").length > 0 },
                  { l:"Document NLP",    d:"Risk extraction · Auditor",  ic:"pdf",   col:C.gold,   done: logs.filter(l=>l.type==="success").length > 1 },
                  { l:"External Agent",  d:"News · MCA · Court",         ic:"globe", col:C.green,  done: logs.filter(l=>l.type==="success").length > 2 },
                  { l:"DD Converter",    d:"Notes → risk signals",        ic:"flag",  col:C.violet, done: logs.filter(l=>l.type==="success").length > 3 },
                  { l:"Risk Scorer AI",  d:"47 params · Five Cs",         ic:"brain", col:C.orange, done: logs.filter(l=>l.type==="success").length > 4 },
                  { l:"CAM Generator",   d:"10-section credit memo",      ic:"doc",   col:C.sub,    done: logs.filter(l=>l.type==="success").length > 5 },
                ].map((s,i) => {
                  const active = isAnalysing && i === logs.filter(l=>l.type==="success").length;
                  return (
                    <div key={s.l} className="card pi" style={{ opacity: s.done || active ? 1 : 0.3, transition:"opacity .5s", animationDelay:`${i*.07}s` }}>
                      <div style={{ padding:"14px 16px", display:"flex", gap:12, alignItems:"center" }}>
                        <div style={{ width:38, height:38, borderRadius:10, background:s.done?C.greenDim:active?`${s.col}18`:C.lift, border:`1px solid ${s.done?C.green:active?s.col:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .4s" }}>
                          {s.done ? <Ic n="check" s={16} c={C.green} /> : active ? <div className="spin" /> : <Ic n={s.ic} s={16} c={s.col} />}
                        </div>
                        <div>
                          <div style={{ fontSize:14, fontWeight:700 }}>{s.l}</div>
                          <div style={{ fontSize:14, color:C.text }}>{s.done ? "✓ Complete" : active ? "Processing…" : s.d}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="card" style={{ borderColor:"rgba(0,212,255,.2)" }}>
                <div style={{ padding:"14px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ animation: isAnalysing ? "spin 1.5s linear infinite" : "none" }}><Ic n="brain" s={18} c={C.cyan} /></div>
                  <span style={{ fontSize:14, fontWeight:700 }}>{isAnalysing ? "Processing…" : result ? "Complete" : "Ready"}</span>
                  {isAnalysing && <span className="tag t-cyan" style={{ marginLeft:"auto" }}>LIVE</span>}
                  {result && <span className="tag t-green" style={{ marginLeft:"auto" }}>DONE</span>}
                </div>
                <div style={{ padding:"8px 20px 16px", maxHeight:280, overflowY:"auto" }}>
                  {logs.map((log,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0", borderBottom:`1px solid ${C.border}`, animation:"rowIn .3s ease both", animationDelay:`${i*.04}s` }}>
                      <div style={{ marginTop:1, flexShrink:0 }}>
                        {log.loading ? <div className="spin" /> : log.type==="success" ? <Ic n="check" s={13} c={C.green} /> : log.type==="warn" ? <Ic n="alert" s={13} c={C.orange} /> : log.type==="error" ? <Ic n="x" s={13} c={C.red} /> : <Ic n="zap" s={13} c={C.cyan} />}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:14, fontWeight:600, color: log.type==="warn"?C.orange:log.type==="error"?C.red:C.text }}>{log.msg}</div>
                        {log.det && <div style={{ fontSize:14, color:C.text, marginTop:2, lineHeight:1.5 }}>{log.det}</div>}
                      </div>
                      <div style={{ fontSize:13, color:C.sub, fontFamily:"'DM Mono',monospace", flexShrink:0 }}>{log.t}</div>
                    </div>
                  ))}
                  {!logs.length && <div style={{ textAlign:"center", padding:24, color:C.sub }}>Initialising…</div>}
                </div>
              </div>

              {result && <div style={{ marginTop:20, textAlign:"right" }}><button className="btn btn-primary" onClick={() => setStep(4)}>View Dashboard <Ic n="arrow" s={15} c="#05070F" /></button></div>}
            </div>
          )}

          {/* ─ STEPS 4-7: pass through to downstream screens ─ */}
          {step >= 4 && result && <DownstreamSteps step={step} setStep={setStep} result={result} camText={camText} fields={fields} R={R} />}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════ HELPER COMPONENTS ══════════════════════════ */

function TabHeader({ letter, color, title, sub }) {
  return (
    <div style={{ marginBottom:22 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
        <div style={{ width:34, height:34, borderRadius:9, background:`${color}18`, border:`1px solid ${color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Mono',monospace", fontWeight:700, fontSize:15, color:color }}>{letter}</div>
        <h2 style={{ fontFamily:"'Instrument Serif',serif", fontSize:24, fontWeight:400 }}>{title}</h2>
      </div>
      <p style={{ fontSize:14, color:C.sub, paddingLeft:46, lineHeight:1.55 }}>{sub}</p>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [screen, setScreen] = useState("splash");
  const [email, setEmail]   = useState("officer@intellicredit.in");
  const [pass, setPass]     = useState("password123");
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState(false);

  const go = async () => {
    if (!email || !pass) return;
    setLoading(true); setErr(false);
    await sleep(1100);
    if (email.includes("@") && pass.length >= 6) onLogin(email.split("@")[0].replace(/\./g," ").replace(/\b\w/g,c=>c.toUpperCase()));
    else { setErr(true); setLoading(false); }
  };

  /* ── SPLASH ── */
  if (screen === "splash") return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", zIndex:1 }}>
      {/* Background */}
      <div style={{ position:"fixed", inset:0, background:`radial-gradient(ellipse 70% 55% at 50% 40%, rgba(0,212,255,0.10) 0%, transparent 65%), ${C.bg}`, zIndex:0, pointerEvents:"none" }} />
      <div style={{ position:"fixed", inset:0, backgroundImage:`linear-gradient(rgba(0,212,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.02) 1px,transparent 1px)`, backgroundSize:"52px 52px", zIndex:0, pointerEvents:"none" }} />
      <div style={{ position:"fixed", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(0,212,255,0.06),transparent 70%)", top:"-15%", left:"-10%", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(155,127,255,0.05),transparent 70%)", bottom:"-10%", right:"-5%", pointerEvents:"none", zIndex:0 }} />

      {/* Centred content */}
      <div style={{ position:"relative", zIndex:5, textAlign:"center", padding:"24px" }}>
        {/* Icon */}
        <div style={{ width:72, height:72, borderRadius:20, background:`linear-gradient(135deg,${C.cyan},#004466)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", boxShadow:`0 0 48px rgba(0,212,255,0.3)`, animation:"glow 3s ease infinite" }}>
          <Ic n="bank" s={32} c="#05070F" />
        </div>

        {/* Title */}
        <div style={{ animation:"fadeUp .7s ease both" }}>
          <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:"clamp(52px,8vw,96px)", fontWeight:400, lineHeight:1, letterSpacing:-2, marginBottom:0 }}>
            Intelli<span style={{ color:C.cyan }}>Credit</span>
          </h1>
        </div>

        {/* Tagline */}
        <div style={{ animation:"fadeUp .7s .15s ease both" }}>
          <p style={{ fontSize:"clamp(13px,1.6vw,16px)", color:C.sub, letterSpacing:"0.18em", textTransform:"uppercase", fontWeight:600, marginTop:16, marginBottom:48 }}>
            AI-Powered Credit Intelligence Platform
          </p>
        </div>

        {/* CTA */}
        <div style={{ animation:"fadeUp .7s .3s ease both" }}>
          <button className="btn btn-primary" style={{ padding:"15px 48px", fontSize:15, borderRadius:12 }} onClick={() => setScreen("login")}>
            <Ic n="zap" s={17} c="#05070F" /> Get Started
          </button>
        </div>
      </div>
    </div>
  );

  /* ── LOGIN ── */
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", zIndex:1 }}>
      <div style={{ position:"fixed", inset:0, background:`radial-gradient(ellipse 70% 50% at 50% 0%, rgba(0,212,255,0.09) 0%, transparent 60%), ${C.bg}`, zIndex:0, pointerEvents:"none" }} />
      <div style={{ position:"fixed", inset:0, backgroundImage:`linear-gradient(rgba(0,212,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.018) 1px,transparent 1px)`, backgroundSize:"52px 52px", zIndex:0, pointerEvents:"none" }} />

      <div style={{ width:"100%", maxWidth:440, position:"relative", zIndex:1 }} className="fu">
        <button className="btn btn-ghost" style={{ fontSize:14, marginBottom:20, padding:"6px 14px" }} onClick={() => setScreen("splash")}>← Back</button>

        <div style={{ textAlign:"center", marginBottom:34 }}>
          <div style={{ width:62, height:62, borderRadius:16, background:`linear-gradient(135deg,${C.cyan},#005577)`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px", animation:"glow 3s ease infinite", boxShadow:`0 0 40px rgba(0,212,255,0.25)` }}>
            <Ic n="bank" s={26} c="#05070F" />
          </div>
          <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:34, lineHeight:1.1 }}>
            Intelli<span style={{ color:C.cyan }}>Credit</span>
          </div>
          <div style={{ fontSize:13, color:C.sub, letterSpacing:2, textTransform:"uppercase", marginTop:5, fontWeight:600 }}>AI Credit Decision Engine</div>
        </div>

        <div className="card" style={{ padding:"32px 36px", borderColor:"rgba(0,212,255,.18)", boxShadow:`0 0 60px rgba(0,212,255,0.07)` }}>
          <div style={{ marginBottom:20 }}>
            <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:22 }}>Welcome back</div>
            <div style={{ fontSize:14, color:C.sub, marginTop:3 }}>Authorised credit officers only</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
            <div>
              <label className="lbl">Email Address</label>
              <input className="inp" style={{ animation:err?"shake .4s ease":"none" }} value={email} onChange={e => { setEmail(e.target.value); setErr(false); }} onKeyDown={e => e.key==="Enter" && go()} />
            </div>
            <div>
              <label className="lbl">Password</label>
              <div style={{ position:"relative" }}>
                <input className="inp" type={show?"text":"password"} style={{ paddingRight:38, animation:err?"shake .4s ease":"none" }} value={pass} onChange={e => { setPass(e.target.value); setErr(false); }} onKeyDown={e => e.key==="Enter" && go()} />
                <button style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:C.muted }} onClick={() => setShow(p=>!p)}>
                  <Ic n="eye" s={14} c={C.muted} />
                </button>
              </div>
            </div>
            {err && (
              <div style={{ padding:"9px 12px", background:C.redDim, border:`1px solid rgba(255,59,96,.3)`, borderRadius:8, fontSize:14, color:C.red, display:"flex", gap:8, alignItems:"center" }}>
                <Ic n="alert" s={13} c={C.red} /> Invalid credentials. Please try again.
              </div>
            )}
            <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center", padding:"13px", marginTop:4, fontSize:14 }} onClick={go} disabled={loading}>
              {loading ? <><div className="spin" style={{ borderTopColor:"#05070F" }} /> Authenticating…</> : <><Ic n="zap" s={15} c="#05070F" /> Sign In</>}
            </button>
          </div>
          <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"center", gap:20 }}>
            {["Bank Officer","Credit Manager","Risk Analyst"].map(r => (
              <span key={r} style={{ fontSize:13, color:C.sub, display:"flex", alignItems:"center", gap:4 }}>
                <Ic n="check" s={10} c={C.green} /> {r}
              </span>
            ))}
          </div>
        </div>
        <p style={{ textAlign:"center", fontSize:13, color:C.sub, marginTop:14 }}>Bank-grade security · All sessions are audited</p>
      </div>
    </div>
  );
}

/* downstream stub for steps 4-7 */
function DownstreamSteps({ step, setStep, result, camText, fields, R }) {
  const decColor = result.decision === "APPROVE" ? C.green : result.decision === "REJECT" ? C.red : C.orange;
  const FIVE_CS = [
    { c:"Character",  k:"character",  note:"char_note",  emoji:"👤", col:C.red },
    { c:"Capacity",   k:"capacity",   note:"cap_note",   emoji:"⚡", col:C.orange },
    { c:"Capital",    k:"capital",    note:"cap2_note",  emoji:"💰", col:C.gold },
    { c:"Collateral", k:"collateral", note:"col_note",   emoji:"🏛️", col:C.green },
    { c:"Conditions", k:"conditions", note:"cond_note",  emoji:"🌐", col:C.cyan },
  ];

  if (step === 4) return (
    <div style={{ padding:"32px 32px 60px", maxWidth:1160, margin:"0 auto", width:"100%" }} className="fu">
      <StepHead n={4} title="Graphs Dashboard" sub={`${fields.companyName} · Risk Score: ${result.overall}/100`} />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:10, marginBottom:18 }}>
        {[
          { l:"EBITDA%", v:`${R.ebitdaM}%`, ok:+R.ebitdaM>8 },{ l:"D/E", v:`${R.de}x`, ok:+R.de<2 },
          { l:"DSCR", v:R.dscr, ok:+R.dscr>1.25 },{ l:"Curr.Ratio", v:R.cr, ok:+R.cr>1.2 },
          { l:"Mismatch", v:`${R.mismatch}%`, ok:!R.fraud },{ l:"Risk Score", v:`${result.overall}`, ok:result.overall<50 },
        ].map(m => (
          <div key={m.l} style={{ padding:"12px 14px", background:C.card, border:`1px solid ${m.ok?"rgba(0,229,160,.2)":"rgba(255,59,96,.2)"}`, borderRadius:10, textAlign:"center" }}>
            <div style={{ fontSize:14, color:C.sub, fontWeight:800, letterSpacing:.5, textTransform:"uppercase" }}>{m.l}</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:22, color:m.ok?C.green:C.red, marginTop:4 }}>{m.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:18, marginBottom:18 }}>
        <div className="card">
          <div className="card-head"><Ic n="chart" s={14} c={C.cyan} /><span style={{ fontSize:14, fontWeight:700, color:C.cyan }}>Revenue & EBITDA Trend</span></div>
          <div style={{ padding:"16px" }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={result.trend||[]}>
                <defs>
                  <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.cyan} stopOpacity={.2}/><stop offset="95%" stopColor={C.cyan} stopOpacity={0}/></linearGradient>
                  <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={.2}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{fill:C.sub,fontSize:14}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:C.sub,fontSize:14}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:14}}/>
                <Area type="monotone" dataKey="rev" stroke={C.cyan} strokeWidth={2} fill="url(#gr)" name="Revenue"/>
                <Area type="monotone" dataKey="eb" stroke={C.green} strokeWidth={2} fill="url(#ge)" name="EBITDA"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><Ic n="chart" s={14} c={C.gold} /><span style={{ fontSize:14, fontWeight:700, color:C.gold }}>Revenue Segments</span></div>
          <div style={{ padding:"16px" }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={result.segments||[]} cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={3} dataKey="value">
                {[C.cyan,C.gold,C.green].map((c,i)=><Cell key={i} fill={c} opacity={.85}/>)}
              </Pie><Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:14}}/></PieChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
              {(result.segments||[]).map((s,i)=><span key={s.name} style={{ fontSize:14, color:C.sub, display:"flex", alignItems:"center", gap:4 }}><div style={{ width:7, height:7, borderRadius:"50%", background:[C.cyan,C.gold,C.green][i] }}/>{s.name} {s.value}%</span>)}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        <div className="card">
          <div className="card-head"><Ic n="brain" s={14} c={C.violet} /><span style={{ fontSize:14, fontWeight:700, color:C.violet }}>Five Cs Radar</span></div>
          <div style={{ padding:12 }}>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={FIVE_CS.map(c=>({c:c.c,v:100-result[c.k]}))}>
                <PolarGrid stroke={C.border}/><PolarAngleAxis dataKey="c" tick={{fill:C.sub,fontSize:14}}/>
                <Radar dataKey="v" stroke={C.violet} fill={C.violet} fillOpacity={.18} strokeWidth={2}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><Ic n="alert" s={14} c={C.red} /><span style={{ fontSize:14, fontWeight:700, color:C.red }}>Risk Dimensions</span></div>
          <div style={{ padding:"16px 12px" }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart layout="vertical" data={[{n:"Fraud",v:result.fraud_risk},{n:"Promoter",v:result.promoter_risk},{n:"Litigation",v:result.litigation_risk},{n:"Industry",v:result.industry_risk},{n:"Capacity",v:result.capacity}]} margin={{left:60,right:16}}>
                <XAxis type="number" domain={[0,100]} tick={{fill:C.sub,fontSize:14}} axisLine={false} tickLine={false}/>
                <YAxis dataKey="n" type="category" tick={{fill:C.sub,fontSize:14}} axisLine={false} tickLine={false} width={58}/>
                <Tooltip contentStyle={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,fontSize:14}}/>
                <Bar dataKey="v" radius={4}>{[result.fraud_risk,result.promoter_risk,result.litigation_risk,result.industry_risk,result.capacity].map((v,i)=><Cell key={i} fill={v>65?C.red:v>40?C.orange:C.green}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <NavRow onBack={()=>setStep(2)} onNext={()=>setStep(5)} nextLabel="Text Summary" />
    </div>
  );

  if (step === 5) return (
    <div style={{ padding:"32px 32px 60px", maxWidth:1000, margin:"0 auto", width:"100%" }} className="fu">
      <StepHead n={5} title="Credit Analysis Summary" sub="AI-generated narrative and structured risk findings" />
      <div className="card" style={{ marginBottom:18, borderColor:"rgba(0,212,255,.15)" }}>
        <div className="card-head"><Ic n="brain" s={14} c={C.cyan} /><span style={{ fontSize:14, fontWeight:700, color:C.cyan }}>AI Credit Summary</span></div>
        <div style={{ padding:"20px 24px", fontSize:15, lineHeight:1.85, color:"#C4D4EC" }}>{result.summary}</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <div className="card"><div className="card-head"><Ic n="alert" s={14} c={C.red}/><span style={{fontSize:14,fontWeight:700,color:C.red}}>Risk Flags</span></div><div className="card-body">{(result.risks||[]).map((r,i)=><div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}><div style={{width:18,height:18,borderRadius:5,background:C.redDim,border:`1px solid rgba(255,59,96,.3)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:14,fontWeight:800,color:C.red}}>{i+1}</span></div><span style={{fontSize:14,color:"#8AABCC",lineHeight:1.5}}>{r}</span></div>)}</div></div>
        <div className="card"><div className="card-head"><Ic n="check" s={14} c={C.green}/><span style={{fontSize:14,fontWeight:700,color:C.green}}>Positives</span></div><div className="card-body">{(result.positives||[]).map((r,i)=><div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}><Ic n="check" s={13} c={C.green}/><span style={{fontSize:14,color:"#8AABCC",lineHeight:1.5}}>{r}</span></div>)}</div></div>
      </div>
      <div className="card" style={{ marginBottom:18 }}>
        <div className="card-head"><Ic n="bank" s={14} c={C.gold}/><span style={{fontSize:14,fontWeight:700,color:C.gold}}>Five Cs Assessment</span></div>
        <div style={{ padding:18, display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
          {FIVE_CS.map(item => {
            const v = result[item.k]; const col = v>65?C.red:v>35?C.orange:C.green;
            return <div key={item.c} style={{padding:12,background:C.lift,border:`1px solid ${C.border}`,borderRadius:10}}>
              <div style={{fontSize:18,marginBottom:4}}>{item.emoji}</div>
              <div style={{fontSize:14,fontWeight:800,color:item.col,textTransform:"uppercase",letterSpacing:.8}}>{item.c}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:24,fontWeight:500,color:col,margin:"4px 0"}}>{v}</div>
              <div className="rbar"><div className="rfill" style={{width:`${v}%`,background:col}}/></div>
              <div style={{fontSize:14,color:C.muted,marginTop:6,lineHeight:1.5}}>{result[item.note]||"—"}</div>
            </div>;
          })}
        </div>
      </div>
      <NavRow onBack={()=>setStep(4)} onNext={()=>setStep(6)} nextLabel="Loan Decision" />
    </div>
  );

  if (step === 6) return (
    <div style={{ padding:"32px 32px 60px", maxWidth:900, margin:"0 auto", width:"100%" }} className="fu">
      <StepHead n={6} title="Loan Decision" sub="AI-recommended credit decision with full explainability" />
      <div className="card" style={{ padding:"40px", textAlign:"center", marginBottom:20, background:`linear-gradient(135deg,${decColor}0A,${decColor}04)`, border:`2px solid ${decColor}44` }}>
        <div style={{ fontSize:14, color:C.muted, letterSpacing:3, textTransform:"uppercase", marginBottom:10 }}>CREDIT DECISION</div>
        <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:60, fontWeight:400, color:decColor, lineHeight:1, marginBottom:16, fontStyle:"italic" }}>{result.decision?.replace("_"," ")}</div>
        <div style={{ display:"flex", justifyContent:"center", gap:36, marginBottom:18, flexWrap:"wrap" }}>
          {[["Sanctioned Amount",`₹${result.amount} Cr`],["Interest Rate",`${result.rate}% p.a.`],["Tenure",result.tenure]].map(([l,v],i)=>(
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{fontSize:14,color:C.muted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{l}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:28,fontWeight:500,color:C.text}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:14,color:"#8AABCC",lineHeight:1.7,maxWidth:560,margin:"0 auto"}}>{result.rationale}</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:18, marginBottom:18 }}>
        <div className="card" style={{ padding:28, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <SmallGauge score={result.overall} />
        </div>
        <div className="card"><div className="card-head"><Ic n="shield" s={14} c={C.violet}/><span style={{fontSize:14,fontWeight:700,color:C.violet}}>Recommended Covenants</span></div><div className="card-body">{(result.covenants||[]).map((c,i)=><div key={i} style={{display:"flex",gap:10,padding:"11px 0",borderBottom:`1px solid ${C.border}`}}><div style={{width:22,height:22,borderRadius:6,background:C.violetDim,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:14,fontWeight:800,color:C.violet}}>{i+1}</span></div><span style={{fontSize:14,color:"#8AABCC",lineHeight:1.5}}>{c}</span></div>)}</div></div>
      </div>
      <NavRow onBack={()=>setStep(5)} onNext={()=>setStep(7)} nextLabel="Generate CAM" nextClass="btn-gold" />
    </div>
  );

  if (step === 7) return (
    <div style={{ padding:"32px 32px 60px", maxWidth:960, margin:"0 auto", width:"100%" }} className="fu">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14, marginBottom:22 }}>
        <div>
          <div style={{ fontSize:14, color:C.sub, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>Step 7 of 7 · Credit Appraisal Memo</div>
          <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:32 }}>{fields.companyName}</h1>
          <p style={{ color:C.text, fontSize:14, marginTop:4 }}>₹{fields.loanAmt}Cr Application · Risk Score: <span style={{ fontFamily:"'DM Mono',monospace", color: result.overall>65?C.red:result.overall>35?C.orange:C.green }}>{result.overall}/100</span></p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
          <span className={`tag ${result.decision==="APPROVE"?"t-green":result.decision==="REJECT"?"t-red":"t-orange"}`} style={{ fontSize:14, padding:"5px 14px" }}>{result.decision?.replace("_"," ")}</span>
          <button className="btn btn-ghost" style={{ fontSize:14 }} onClick={() => {
            const txt = ["CREDIT APPRAISAL MEMO","=".repeat(70),`Company: ${fields.companyName}  |  Sector: ${fields.sector}`,`Loan: ₹${fields.loanAmt}Cr  |  Decision: ${result.decision}  |  Score: ${result.overall}/100`,`Sanctioned: ₹${result.amount}Cr @ ${result.rate}% — ${result.tenure}`,"=".repeat(70),"",camText||"","","=".repeat(70),`Generated: ${new Date().toLocaleDateString("en-IN")} by Intelli-Credit AI`].join("\n");
            const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt],{type:"text/plain"})); a.download=`CAM_${fields.companyName.replace(/\s+/g,"_")}.txt`; a.click();
          }}><Ic n="download" s={13} /> Export</button>
          <button className="btn btn-ghost" style={{ fontSize:14 }} onClick={() => window.location.reload()}><Ic n="refresh" s={13} /> New Case</button>
        </div>
      </div>
      <div className="card" style={{ marginBottom:18, background:`linear-gradient(135deg,${C.lift},${C.card})`, borderColor:C.borderHi }}>
        <div style={{ padding:"22px 28px", display:"grid", gridTemplateColumns:"1fr auto", gap:20 }}>
          <div>
            <div style={{ fontSize:14, color:C.muted, letterSpacing:2, textTransform:"uppercase", marginBottom:4 }}>CREDIT APPRAISAL MEMO — CONFIDENTIAL</div>
            <div style={{ fontFamily:"'Instrument Serif',serif", fontSize:22 }}>{fields.companyName}</div>
            <div style={{ color:C.sub, fontSize:14, marginTop:3 }}>{fields.sector} · {fields.years} yrs · Promoter: {fields.promoter}</div>
          </div>
          <div style={{ borderLeft:`1px solid ${C.border}`, paddingLeft:20, textAlign:"right" }}>
            <div style={{ fontSize:14, color:C.muted, textTransform:"uppercase", letterSpacing:1.5 }}>Date</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:14, marginTop:2 }}>{new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</div>
            <div style={{ fontSize:14, color:C.muted, textTransform:"uppercase", letterSpacing:1.5, marginTop:8 }}>Prepared By</div>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:14, marginTop:2 }}>Intelli-Credit AI Engine</div>
          </div>
        </div>
      </div>
      <div className="card" style={{ padding:"28px 34px" }}>
        {(camText||"").split("\n").map((line,i) => {
          const clean = line.replace(/\*\*/g,"");
          const isH = /^\d+\.\s+[A-Z]/.test(clean)||(/^[A-Z\s\-—&]+$/.test(clean.trim())&&clean.trim().length>4&&clean.trim().length<70);
          return isH
            ? <div key={i} style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:500, color:C.cyan, textTransform:"uppercase", letterSpacing:1.5, marginTop:22, marginBottom:9, paddingBottom:8, borderBottom:`1px solid ${C.border}` }}>{clean}</div>
            : <div key={i} style={{ fontSize:14, color:"#BAD0E8", lineHeight:1.8, marginBottom:clean.trim()?6:3 }}>{clean||"\u00A0"}</div>;
        })}
      </div>
      <div style={{ marginTop:18, padding:"14px 20px", background:C.lift, borderRadius:10, border:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
        <div style={{ fontSize:14, color:C.muted }}>This CAM was generated by <strong style={{ color:C.cyan }}>Intelli-Credit AI</strong> and must be reviewed by an authorised credit officer before disbursement.</div>
        <button className="btn btn-ghost" onClick={() => setStep(6)} style={{ fontSize:14 }}>← Decision</button>
      </div>
    </div>
  );
  return null;
}

function StepHead({ n, title, sub }) {
  return (
    <div style={{ marginBottom:24 }}>
      <div style={{ fontSize:14, color:C.sub, letterSpacing:2, textTransform:"uppercase", marginBottom:5 }}>Step {n} of 7</div>
      <h1 style={{ fontFamily:"'Instrument Serif',serif", fontSize:32, fontWeight:400 }}>{title}</h1>
      <p style={{ color:C.text, fontSize:14, marginTop:4 }}>{sub}</p>
    </div>
  );
}

function NavRow({ onBack, onNext, nextLabel, nextClass = "btn-primary" }) {
  return (
    <div style={{ marginTop:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <button className="btn btn-ghost" onClick={onBack} style={{ fontSize:14 }}>← Back</button>
      <button className={`btn ${nextClass}`} onClick={onNext}>{nextLabel} <Ic n="arrow" s={14} c={nextClass==="btn-gold"?"#05070F":"#05070F"} /></button>
    </div>
  );
}

function SmallGauge({ score }) {
  const col = score>65?C.red:score>35?C.orange:C.green;
  const r=58, cx=70, cy=70, circ=2*Math.PI*r;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth="11"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth="11"
          strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round"
          style={{transform:`rotate(-90deg)`,transformOrigin:`${cx}px ${cy}px`,transition:"stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1)"}}/>
        <text x={cx} y={cy-6} textAnchor="middle" fill={col} fontSize="28" fontWeight="700" fontFamily="DM Mono">{score}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill={C.sub} fontSize="9" fontFamily="Figtree" fontWeight="700" letterSpacing="1.5">RISK SCORE</text>
      </svg>
      <span style={{ fontSize:14, fontWeight:800, letterSpacing:2, color:col, textTransform:"uppercase" }}>{score>65?"HIGH":score>35?"MODERATE":"LOW"} RISK</span>
    </div>
  );
}
