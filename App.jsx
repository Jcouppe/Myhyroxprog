import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Activity, Calendar, ChevronDown, Dumbbell, Footprints, Timer,
  Target, Flame, RotateCcw, Printer, Wind, Repeat, Anchor,
  ArrowRight, Check, MapPin, Gauge, Zap
} from "lucide-react";

/* =====================================================================
   MyHyroxProg — générateur de programme Hyrox personnalisé
   Tout est calculé côté client. Aucune donnée n'est enregistrée.
   ===================================================================== */

/* ---------- Référence : les 8 stations Hyrox ---------- */
const STATIONS = [
  { key: "ski",      name: "SkiErg",            spec: "1000 m",  group: "Haut du corps / tirage" },
  { key: "sledpush", name: "Sled Push",         spec: "50 m",    group: "Jambes / poussée" },
  { key: "sledpull", name: "Sled Pull",         spec: "50 m",    group: "Dos / tirage / jambes" },
  { key: "burpee",   name: "Burpee Broad Jump", spec: "80 m",    group: "Conditionnement explosif" },
  { key: "row",      name: "Rameur",            spec: "1000 m",  group: "Endurance corps entier" },
  { key: "farmers",  name: "Farmers Carry",     spec: "200 m",   group: "Grip / gainage / trapèzes" },
  { key: "lunge",    name: "Sandbag Lunges",    spec: "100 m",   group: "Jambes / gainage" },
  { key: "wallball", name: "Wall Balls",        spec: "100 reps", group: "Squat-endurance / épaules" },
];

/* ---------- Poids indicatifs par division (saison 2025/26) ---------- */
const DIVISIONS = {
  femme_open: {
    label: "Femme — Open", gender: "F", pro: false,
    push: "102 kg", pull: "78 kg", farmers: "2 × 16 kg", lunge: "sac 10 kg", wallball: "4 kg → 2,70 m",
  },
  homme_open: {
    label: "Homme — Open", gender: "H", pro: false,
    push: "152 kg", pull: "103 kg", farmers: "2 × 24 kg", lunge: "sac 20 kg", wallball: "6 kg → 3,00 m",
  },
  femme_pro: {
    label: "Femme — Pro", gender: "F", pro: true,
    push: "152 kg", pull: "103 kg", farmers: "2 × 24 kg", lunge: "sac 20 kg", wallball: "6 kg → 2,70 m",
  },
  homme_pro: {
    label: "Homme — Pro", gender: "H", pro: true,
    push: "175 kg", pull: "153 kg", farmers: "2 × 32 kg", lunge: "sac 30 kg", wallball: "9 kg → 3,00 m",
  },
};

/* ---------- Utilitaires temps / allure ---------- */
const pad = (n) => String(n).padStart(2, "0");
const secToMMSS = (s) => `${Math.floor(s / 60)}:${pad(Math.round(s % 60))}`;
function mmssToSec(str) {
  if (!str) return null;
  const m = String(str).trim().match(/^(\d{1,2})[:.](\d{1,2})$/);
  if (!m) { const n = Number(str); return isNaN(n) ? null : n * 60; }
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
const fmtPace = (secPerKm) => `${secToMMSS(secPerKm)} /km`;

/* Niveaux de course → estimation d'un temps sur 5 km si non renseigné */
const RUN_LEVEL_5K = { debutant: 30 * 60, intermediaire: 25 * 60, confirme: 21 * 60, rapide: 18 * 60 };

function paceZones(fiveKsec) {
  const p = fiveKsec / 5; // allure 5 km en s/km
  return {
    p5k: p,
    easy: p + 70,
    long: p + 55,
    tempo: p + 22,
    threshold: p + 12,
    interval: Math.max(p - 6, 165),
    hyrox: p + 38, // allure cible "compromise running" course Hyrox
  };
}

/* ---------- Construction des phases ---------- */
function buildPhases(totalWeeks) {
  let taper = totalWeeks >= 10 ? 2 : 1;
  if (totalWeeks <= 4) taper = 1;
  const work = Math.max(1, totalWeeks - taper);
  let base = Math.max(1, Math.round(work * 0.3));
  let specific = Math.max(1, Math.round(work * 0.3));
  let build = work - base - specific;
  while (build < 1) { if (base > 1) base--; else if (specific > 1) specific--; build = work - base - specific; }
  // construit la liste semaine par semaine
  const seq = [];
  for (let i = 0; i < base; i++) seq.push("base");
  for (let i = 0; i < build; i++) seq.push("build");
  for (let i = 0; i < specific; i++) seq.push("specific");
  for (let i = 0; i < taper; i++) seq.push("taper");
  return seq.slice(0, totalWeeks);
}

const PHASE_META = {
  base:     { label: "Fondation",  color: "var(--cobalt)", desc: "On bâtit le moteur aérobie et la base de force." },
  build:    { label: "Développement", color: "var(--ink)", desc: "Montée en intensité, force et premières simulations." },
  specific: { label: "Spécifique", color: "var(--orange)", desc: "On devient Hyrox : course fatiguée et simulations." },
  taper:    { label: "Affûtage",   color: "var(--accent-deep)", desc: "On réduit le volume, on garde le tranchant. Jour J." },
};

/* ---------- Adaptations matériel ---------- */
function equipAlt(mvt, equip) {
  const G = equip === "gym", L = equip === "limited";
  switch (mvt) {
    case "squat":   return G ? "Back squat (barre)" : L ? "Goblet squat (haltère/kettlebell)" : "Squat au poids du corps + sac à dos lesté / squat bulgare";
    case "hinge":   return G ? "Soulevé de terre / RDL (barre)" : L ? "RDL haltères / swings kettlebell" : "RDL unijambe + soulevé sac lesté";
    case "press":   return G ? "Développé épaules (barre/haltères)" : L ? "Développé haltères / pompes lestées" : "Pompes (variantes) + développé sac lesté";
    case "pull":    return G ? "Tractions / tirage horizontal" : L ? "Tractions / rowing haltères" : "Tractions (barre/élastique) + rowing élastique";
    case "ski":     return G ? "SkiErg" : L ? "Swings + battle ropes" : "Swings sac lesté + planche dynamique";
    case "row":     return G ? "Rameur" : L ? "Vélo / corde à sauter" : "Burpees rythmés / corde à sauter";
    case "sledpush":return G ? "Sled push / prowler" : L ? "Poussée traîneau ou montées en côte" : "Tapis incliné rapide / fentes marchées lestées / sprints en côte";
    case "sledpull":return G ? "Sled pull (corde)" : L ? "Tirage corde / rameur lourd" : "Tirage élastique lourd + rowing";
    case "wallball":return G || L ? "Wall balls (medecine ball + mur)" : "Thrusters lestés (sac/haltères) face à une cible haute";
    case "farmers": return G ? "Farmers carry (haltères/kettlebells)" : L ? "Port de charges (haltères/kettlebells)" : "Port de jerricans d'eau / sac à dos lesté";
    case "lunge":   return G || L ? "Fentes marchées avec sandbag" : "Fentes marchées + sac à dos lesté";
    default: return mvt;
  }
}

/* ---------- Drills ciblés par station (pour les points faibles) ---------- */
function stationDrill(key, w, equip) {
  switch (key) {
    case "ski":      return `${equipAlt("ski", equip)} — 4 × 250 m, départ explosif, rythme régulier`;
    case "sledpush": return `${equipAlt("sledpush", equip)} — 6 × 15 m lourd (≈ ${w.push}), petits pas, dos gainé`;
    case "sledpull": return `${equipAlt("sledpull", equip)} — 6 × 15 m (≈ ${w.pull}), tirer hanches basses`;
    case "burpee":   return "Burpee broad jumps — 5 × 10, rester bas, sauter loin, respiration calme";
    case "row":      return `${equipAlt("row", equip)} — 4 × 300 m allure cible, gestion du tirage jambes→dos→bras`;
    case "farmers":  return `${equipAlt("farmers", equip)} — 4 × 50 m (≈ ${w.farmers}), grip ferme, pas rapides`;
    case "lunge":    return `${equipAlt("lunge", equip)} — 4 × 25 m (${w.lunge}), genou qui touche, buste droit`;
    case "wallball":  return `${equipAlt("wallball", equip)} — 5 × 20 (${w.wallball}), squat complet, lancer dans le rythme`;
    default: return "";
  }
}

/* ---------- Générateurs de séances ---------- */
const ramp = (phaseProgress, lo, hi) => Math.round(lo + (hi - lo) * phaseProgress);

function sEasyRun(ctx) {
  const { z, phaseKey, pp } = ctx;
  const km = phaseKey === "base" ? ramp(pp, 5, 8) : phaseKey === "build" ? ramp(pp, 6, 9) : 6;
  return {
    cat: "run", title: "Sortie souple", tag: "Endurance Z2", duration: km * 6 + 12,
    blocks: [
      { label: "Échauffement", items: ["5 min marche active + mobilité chevilles/hanches"] },
      { label: "Bloc principal", items: [`${km} km en aisance — allure ${fmtPace(z.easy)} (tu peux parler)`] },
      { label: "Notes", items: ["But : volume facile. Si fatigue, ralentis sans culpabiliser."] },
    ],
  };
}

function sLongRun(ctx) {
  const { z, phaseKey, pp } = ctx;
  const km = phaseKey === "base" ? ramp(pp, 8, 11) : phaseKey === "build" ? ramp(pp, 10, 14) : ramp(pp, 8, 12);
  const finishKm = phaseKey === "base" ? 0 : Math.max(2, Math.round(km * 0.25));
  return {
    cat: "run", title: "Sortie longue", tag: "Endurance fondamentale", duration: km * 6 + 15,
    blocks: [
      { label: "Échauffement", items: ["10 min très facile + montées de genoux / talons-fesses"] },
      { label: "Bloc principal", items: [
        `${km - finishKm} km à ${fmtPace(z.long)}`,
        finishKm ? `Puis ${finishKm} km à allure course Hyrox ${fmtPace(z.hyrox)} (jambes qui apprennent à courir fatiguées)` : "Allure régulière du début à la fin",
      ].filter(Boolean) },
      { label: "Notes", items: ["Hydratation + petit ravito si > 75 min."] },
    ],
  };
}

function sIntervals(ctx) {
  const { z, phaseKey, wk } = ctx;
  const menus = {
    base:     [["8 × 400 m", "récup 90 s trot"], ["6 × 600 m", "récup 90 s trot"]],
    build:    [["6 × 800 m", "récup 2 min trot"], ["5 × 1000 m", "récup 2 min trot"], ["10 × 400 m", "récup 75 s"]],
    specific: [["4 × 1000 m", "récup 2 min"], ["5 × 800 m", "récup 90 s"], ["3 × 1200 m", "récup 2 min30"]],
    taper:    [["5 × 400 m vif", "récup 2 min, fraîcheur avant tout"]],
  };
  const list = menus[phaseKey] || menus.build;
  const pick = list[wk % list.length];
  return {
    cat: "run", title: "Fractionné (VMA / seuil)", tag: "Vitesse & VO₂", duration: 55,
    blocks: [
      { label: "Échauffement", items: ["15 min progressif + 4 lignes droites + gammes"] },
      { label: "Bloc principal", items: [`${pick[0]} à ${fmtPace(z.interval)} — ${pick[1]}`] },
      { label: "Retour au calme", items: ["10 min trot très facile"] },
    ],
  };
}

function sTempo(ctx) {
  const { z, phaseKey, pp } = ctx;
  const min = phaseKey === "base" ? ramp(pp, 18, 25) : phaseKey === "build" ? ramp(pp, 25, 35) : ramp(pp, 20, 30);
  return {
    cat: "run", title: "Tempo / seuil", tag: "Endurance de vitesse", duration: min + 30,
    blocks: [
      { label: "Échauffement", items: ["15 min facile + 3 lignes droites"] },
      { label: "Bloc principal", items: [`${min} min en continu à ${fmtPace(z.tempo)} (effort « confortablement dur »)`] },
      { label: "Retour au calme", items: ["10 min trot"] },
    ],
  };
}

function sStrengthLower(ctx) {
  const { phaseKey, equip, weak, w } = ctx;
  const scheme = phaseKey === "base" ? "4 × 8–10" : phaseKey === "build" ? "5 × 4–6 (lourd)" : "4 × 6 explosif";
  const items = [
    `${equipAlt("squat", equip)} — ${scheme}`,
    `${equipAlt("hinge", equip)} — 4 × 6–8`,
    `${equipAlt("sledpush", equip)} — 5 × 15 m (≈ ${w.push}) si dispo`,
    `${equipAlt("lunge", equip)} — 3 × 20 m lestées`,
  ];
  const focus = ["sledpush", "sledpull", "lunge"].filter((k) => weak.includes(k)).map((k) => stationDrill(k, w, equip));
  return {
    cat: "strength", title: "Force — bas du corps", tag: "Jambes & chaîne postérieure", duration: 65,
    blocks: [
      { label: "Échauffement", items: ["8 min vélo/corde + mobilité hanches + activation fessiers"] },
      { label: "Bloc principal", items },
      ...(focus.length ? [{ label: "Point faible ciblé", items: focus }] : []),
      { label: "Gainage", items: ["3 × 45 s planche + 3 × 12 dead bug"] },
    ],
  };
}

function sStrengthUpper(ctx) {
  const { phaseKey, equip, weak, w } = ctx;
  const scheme = phaseKey === "base" ? "4 × 8–10" : "4 × 5–6";
  const items = [
    `${equipAlt("press", equip)} — ${scheme}`,
    `${equipAlt("pull", equip)} — 4 × 6–10`,
    `${equipAlt("ski", equip)} — 4 × 250 m`,
    `${equipAlt("farmers", equip)} — 4 × 40 m (≈ ${w.farmers})`,
  ];
  const focus = ["ski", "sledpull", "farmers", "row"].filter((k) => weak.includes(k)).map((k) => stationDrill(k, w, equip));
  return {
    cat: "strength", title: "Force — haut du corps & grip", tag: "Tirage, épaules, préhension", duration: 60,
    blocks: [
      { label: "Échauffement", items: ["8 min rameur léger + rotations épaules + élastique"] },
      { label: "Bloc principal", items },
      ...(focus.length ? [{ label: "Point faible ciblé", items: focus }] : []),
      { label: "Gainage", items: ["3 × 30 s gainage latéral / côté + suspension barre 3 × max"] },
    ],
  };
}

function sCompromised(ctx) {
  const { z, phaseKey, equip, w } = ctx;
  const rounds = phaseKey === "build" ? 4 : 5;
  return {
    cat: "hyrox", title: "Course compromise", tag: "Courir sur jambes fatiguées", duration: 55,
    blocks: [
      { label: "Échauffement", items: ["12 min progressif + gammes"] },
      { label: "Bloc principal", items: [
        `${rounds} tours à enchaîner sans pause longue :`,
        `• 800 m à ${fmtPace(z.hyrox)}`,
        `• 20 ${equipAlt("wallball", equip)} (${w.wallball})`,
        `• 15 burpee broad jumps`,
      ] },
      { label: "Notes", items: ["Objectif : garder la même allure de course à chaque tour malgré la fatigue."] },
    ],
  };
}

function sHyroxSim(ctx) {
  const { z, phaseKey, pp, equip, w, weak } = ctx;
  // nombre de stations simulées grandit avec la prépa
  const nStations = phaseKey === "build" ? ramp(pp, 3, 5) : ramp(pp, 5, 8);
  const seq = STATIONS.slice(0, nStations);
  const recipe = {
    ski: `${equipAlt("ski", equip)} 1000 m`,
    sledpush: `${equipAlt("sledpush", equip)} 50 m (≈ ${w.push})`,
    sledpull: `${equipAlt("sledpull", equip)} 50 m (≈ ${w.pull})`,
    burpee: "Burpee broad jumps 80 m",
    row: `${equipAlt("row", equip)} 1000 m`,
    farmers: `${equipAlt("farmers", equip)} 200 m (${w.farmers})`,
    lunge: `${equipAlt("lunge", equip)} 100 m (${w.lunge})`,
    wallball: `Wall balls 100 reps (${w.wallball})`,
  };
  const items = [`Format : 1 km de course + 1 station, répété ${nStations} fois.`, `Allure course cible : ${fmtPace(z.hyrox)}`];
  seq.forEach((s, i) => items.push(`Run ${i + 1} (1 km) → ${recipe[s.key]}`));
  return {
    cat: "hyrox", title: nStations >= 8 ? "Simulation Hyrox complète" : `Simulation Hyrox (${nStations} stations)`, tag: "Spécifique course", duration: 30 + nStations * 12,
    blocks: [
      { label: "Échauffement", items: ["15 min progressif + mobilité + 2 stations légères"] },
      { label: "Le parcours", items },
      ...(weak.length ? [{ label: "Focus", items: [`Garde le calme sur tes points faibles : ${weak.map((k) => STATIONS.find((s) => s.key === k)?.name).join(", ")}.`] }] : []),
      { label: "Notes", items: ["Chronomètre chaque station + chaque km pour suivre tes progrès."] },
    ],
  };
}

function sRecovery() {
  return {
    cat: "recovery", title: "Récupération active", tag: "Mobilité & régénération", duration: 35,
    blocks: [
      { label: "Au choix", items: ["25–30 min très facile : marche rapide, vélo, ou nage"] },
      { label: "Mobilité", items: ["10 min : hanches, chevilles, épaules, thoraciques"] },
      { label: "Notes", items: ["Aucune intensité. Le progrès se construit pendant la récupération."] },
    ],
  };
}

function sRaceRehearsal(ctx) {
  const { z, equip, w } = ctx;
  return {
    cat: "hyrox", title: "Répétition jour J", tag: "Affûtage — court & vif", duration: 45,
    blocks: [
      { label: "Échauffement", items: ["15 min comme le jour de la course : progressif + gammes + 2 lignes droites"] },
      { label: "Bloc principal", items: [
        "Mini-simulation 3 tours seulement :",
        `• 1 km à ${fmtPace(z.hyrox)}`,
        `• 1 station (alterne ${equipAlt("wallball", equip)} / ${equipAlt("sledpush", equip)} / ${equipAlt("row", equip)})`,
      ] },
      { label: "Notes", items: ["Reste large sous ta limite. On entretient, on ne construit plus.", "Teste tenue, chaussures, nutrition, transitions."] },
    ],
  };
}

/* ---------- Plan hebdo : quelles séances et quel placement ---------- */
function weeklyCategories(daysPerWeek, wk) {
  // renvoie une liste de clés de générateurs, ordonnées
  const runType = wk % 2 === 0 ? "intervals" : "tempo";
  switch (daysPerWeek) {
    case 3: return [runType, "strengthLower", wk % 2 === 0 ? "hyroxSim" : "longRun"];
    case 4: return ["intervals", "strengthLower", wk % 2 === 0 ? "longRun" : "compromised", wk % 2 === 0 ? "strengthUpper" : "hyroxSim"];
    case 5: return ["intervals", "strengthLower", "tempo", "strengthUpper", wk % 2 === 0 ? "hyroxSim" : "longRun"];
    case 6: return ["intervals", "strengthLower", "easyRun", "strengthUpper", "hyroxSim", "longRun"];
    default: return [runType, "strengthLower", "hyroxSim"];
  }
}
const GENERATORS = {
  easyRun: sEasyRun, longRun: sLongRun, intervals: sIntervals, tempo: sTempo,
  strengthLower: sStrengthLower, strengthUpper: sStrengthUpper,
  compromised: sCompromised, hyroxSim: sHyroxSim, recovery: sRecovery, raceRehearsal: sRaceRehearsal,
};

/* Répartition sur 7 jours (Lun→Dim) ; 'rest' = repos */
const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
function weekLayout(daysPerWeek) {
  switch (daysPerWeek) {
    case 3: return [0, "rest", 1, "rest", 2, "rest", "rest"];
    case 4: return [0, "rest", 1, 2, "rest", 3, "rest"];
    case 5: return [0, 1, "rest", 2, 3, "rest", 4];
    case 6: return [0, 1, "rest", 2, 3, 4, 5];
    default: return [0, "rest", 1, "rest", 2, "rest", "rest"];
  }
}

/* ---------- Construction complète du programme ---------- */
function generateProgram(form) {
  const totalWeeks = form.weeks;
  const phaseSeq = buildPhases(totalWeeks);
  const fiveK = mmssToSec(form.fiveKTime) || RUN_LEVEL_5K[form.runLevel] || RUN_LEVEL_5K.intermediaire;
  const z = paceZones(fiveK);
  const w = DIVISIONS[form.division];
  const weak = form.weakStations || [];
  const equip = form.equipment;

  // index de chaque phase pour calculer la progression interne (pp = 0..1)
  const phaseCounts = phaseSeq.reduce((a, k) => ((a[k] = (a[k] || 0) + 1), a), {});
  const phaseSeen = {};

  const weeks = phaseSeq.map((phaseKey, i) => {
    phaseSeen[phaseKey] = (phaseSeen[phaseKey] || 0);
    const pp = phaseCounts[phaseKey] > 1 ? phaseSeen[phaseKey] / (phaseCounts[phaseKey] - 1) : 1;
    phaseSeen[phaseKey]++;

    const isRaceWeek = i === totalWeeks - 1;
    const isDeload = !isRaceWeek && phaseKey !== "taper" && (i + 1) % 4 === 0 && i < totalWeeks - 2;

    const cats = weeklyCategories(form.daysPerWeek, i);
    const ctxBase = { z, phaseKey, pp, wk: i, equip, w, weak };

    let sessions = cats.map((c) => GENERATORS[c]({ ...ctxBase }));

    // Affûtage : on remplace par séances courtes/vives, répétition J-J
    if (phaseKey === "taper") {
      sessions = sessions.map((s, idx) => {
        if (s.cat === "strength") return { ...s, blocks: s.blocks.map((b) => b.label === "Bloc principal" ? { ...b, items: b.items.map((it) => it.replace(/\d+ × \d+[^\u2009]*/, (m) => m)).slice(0, 2) } : b), duration: Math.round(s.duration * 0.6), tag: "Entretien léger" };
        if (s.cat === "hyrox") return sRaceRehearsal(ctxBase);
        return GENERATORS.easyRun(ctxBase);
      });
      if (isRaceWeek) {
        sessions = [GENERATORS.easyRun(ctxBase), sRaceRehearsal(ctxBase), { cat: "recovery", title: "Veille de course", tag: "Activation", duration: 20, blocks: [{ label: "Programme", items: ["15 min footing très léger + 3 lignes droites", "Mobilité douce, étirements légers", "Repos, hydratation, sommeil. Prépare ton sac."] }] }];
      }
    }

    // Deload : on allège
    if (isDeload) {
      sessions = sessions.map((s) => ({ ...s, duration: Math.round(s.duration * 0.65), tag: s.tag + " · allégé" }));
    }

    const layout = weekLayout(form.daysPerWeek).map((slot) => slot === "rest" ? null : sessions[slot] || null);
    // un jour de repos -> récup active (le premier rest)
    const restIdxs = layout.map((s, idx) => s === null ? idx : -1).filter((x) => x >= 0);
    if (restIdxs.length && form.daysPerWeek <= 5) layout[restIdxs[Math.floor(restIdxs.length / 2)]] = sRecovery();

    const totalMin = layout.reduce((a, s) => a + (s ? s.duration : 0), 0);
    const totalKm = Math.round(sessions.filter((s) => s.cat === "run" || s.cat === "hyrox").length * 6); // estimation indicative

    let focus = PHASE_META[phaseKey].desc;
    if (isDeload) focus = "Semaine de récupération : volume réduit pour absorber le travail et progresser.";
    if (isRaceWeek) focus = "Semaine de course ! Fraîcheur, routine, confiance. Tu es prêt·e.";

    return {
      number: i + 1, phaseKey, phaseLabel: PHASE_META[phaseKey].label, color: PHASE_META[phaseKey].color,
      isDeload, isTaper: phaseKey === "taper", isRaceWeek, focus, totalMin, days: layout,
    };
  });

  return { totalWeeks, daysPerWeek: form.daysPerWeek, division: w, z, phaseSeq, weeks, fiveK, weak };
}

/* ============================ UI ============================ */

const CAT_STYLE = {
  run: { c: "var(--cobalt)", Icon: Footprints, label: "Course" },
  strength: { c: "var(--ink)", Icon: Dumbbell, label: "Force" },
  hyrox: { c: "var(--orange)", Icon: Flame, label: "Hyrox" },
  recovery: { c: "var(--muted)", Icon: Wind, label: "Récup" },
};

function RhythmStrip({ height = 14 }) {
  // élément signature : la séquence fixe course-station ×8
  return (
    <div className="rhythm" style={{ height }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <React.Fragment key={i}>
          <span className="rhythm-run" title="1 km course" />
          <span className="rhythm-station" title="station" />
        </React.Fragment>
      ))}
      <span className="rhythm-run rhythm-finish" title="dernier km" />
    </div>
  );
}

/* ---------------- Formulaire (wizard) ---------------- */
const STEPS = ["La course", "Course à pied", "Force & stations", "Disponibilité"];

function Wizard({ onGenerate }) {
  const [step, setStep] = useState(0);
  const [raceDate, setRaceDate] = useState("");
  const [division, setDivision] = useState("homme_open");
  const [goal, setGoal] = useState("finir");
  const [knows5k, setKnows5k] = useState("yes");
  const [fiveKTime, setFiveKTime] = useState("");
  const [runLevel, setRunLevel] = useState("intermediaire");
  const [strengthLevel, setStrengthLevel] = useState(3);
  const [experience, setExperience] = useState("intermediaire");
  const [equipment, setEquipment] = useState("gym");
  const [weakStations, setWeak] = useState([]);
  const [daysPerWeek, setDays] = useState(4);

  const weeksFromDate = useMemo(() => {
    if (!raceDate) return null;
    const diff = (new Date(raceDate) - new Date()) / (1000 * 60 * 60 * 24 * 7);
    return Math.floor(diff);
  }, [raceDate]);

  const toggleWeak = (k) => setWeak((p) => p.includes(k) ? p.filter((x) => x !== k) : p.length >= 4 ? p : [...p, k]);

  const canNext = () => {
    if (step === 0) return weeksFromDate !== null && weeksFromDate >= 1;
    if (step === 1) return knows5k === "no" || mmssToSec(fiveKTime) !== null;
    return true;
  };

  const submit = () => {
    const weeks = Math.min(24, Math.max(2, weeksFromDate));
    onGenerate({
      weeks, division, goal,
      fiveKTime: knows5k === "yes" ? fiveKTime : "",
      runLevel, strengthLevel, experience, equipment, weakStations, daysPerWeek,
    });
  };

  return (
    <div className="card wizard">
      <div className="wiz-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`wiz-step ${i === step ? "on" : i < step ? "done" : ""}`}>
            <span className="wiz-num">{i < step ? <Check size={13} /> : i + 1}</span>
            <span className="wiz-label">{s}</span>
          </div>
        ))}
      </div>

      <div className="wiz-body">
        {step === 0 && (
          <>
            <h3 className="q">Quand a lieu ta course&nbsp;?</h3>
            <label className="field">
              <span className="field-label"><Calendar size={14} /> Date de l'épreuve</span>
              <input type="date" value={raceDate} onChange={(e) => setRaceDate(e.target.value)} className="input" />
            </label>
            {weeksFromDate !== null && (
              <p className={`hint ${weeksFromDate < 2 ? "warn" : ""}`}>
                {weeksFromDate < 1 ? "Cette date est passée ou trop proche — choisis une date future."
                  : weeksFromDate < 4 ? `${weeksFromDate} semaine(s) : c'est court. On fera une préparation finale ciblée.`
                  : weeksFromDate > 24 ? `${weeksFromDate} semaines : on plafonnera le plan à 24 semaines.`
                  : `${weeksFromDate} semaines de préparation. Parfait pour une vraie progression.`}
              </p>
            )}
            <h3 className="q mt">Ta division</h3>
            <div className="grid2">
              {Object.entries(DIVISIONS).map(([k, v]) => (
                <button key={k} className={`chip ${division === k ? "on" : ""}`} onClick={() => setDivision(k)}>{v.label}</button>
              ))}
            </div>
            <p className="hint subtle">Doubles / Relais : choisis ta division de poids (Open ou Pro) la plus proche.</p>
            <h3 className="q mt">Ton objectif</h3>
            <div className="grid3">
              {[["finir", "Terminer"], ["temps", "Temps cible"], ["perf", "Performance / podium"]].map(([k, l]) => (
                <button key={k} className={`chip ${goal === k ? "on" : ""}`} onClick={() => setGoal(k)}>{l}</button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 className="q">Connais-tu ton temps sur 5 km&nbsp;?</h3>
            <div className="grid2">
              <button className={`chip ${knows5k === "yes" ? "on" : ""}`} onClick={() => setKnows5k("yes")}>Oui, je le connais</button>
              <button className={`chip ${knows5k === "no" ? "on" : ""}`} onClick={() => setKnows5k("no")}>Non, j'estime mon niveau</button>
            </div>
            {knows5k === "yes" ? (
              <label className="field mt">
                <span className="field-label"><Timer size={14} /> Temps sur 5 km (mm:ss)</span>
                <input className="input mono" placeholder="ex. 24:30" value={fiveKTime} onChange={(e) => setFiveKTime(e.target.value)} />
                {fiveKTime && mmssToSec(fiveKTime) === null && <span className="hint warn">Format attendu : minutes:secondes, ex. 24:30</span>}
              </label>
            ) : (
              <div className="mt">
                <span className="field-label"><Gauge size={14} /> Mon niveau en course</span>
                <div className="grid2">
                  {[["debutant", "Débutant (~30 min/5 km)"], ["intermediaire", "Intermédiaire (~25 min)"], ["confirme", "Confirmé (~21 min)"], ["rapide", "Rapide (~18 min)"]].map(([k, l]) => (
                    <button key={k} className={`chip ${runLevel === k ? "on" : ""}`} onClick={() => setRunLevel(k)}>{l}</button>
                  ))}
                </div>
              </div>
            )}
            <p className="hint subtle mt">Ce temps sert à calculer toutes tes allures d'entraînement (souple, tempo, fractionné, allure course).</p>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="q">Ton niveau de force / renforcement</h3>
            <div className="range-row">
              <input type="range" min="1" max="5" value={strengthLevel} onChange={(e) => setStrengthLevel(Number(e.target.value))} className="range" />
              <span className="mono range-val">{strengthLevel}/5</span>
            </div>
            <h3 className="q mt">Ton expérience fitness fonctionnel / Hyrox</h3>
            <div className="grid3">
              {[["debutant", "Débutant"], ["intermediaire", "Intermédiaire"], ["avance", "Avancé"]].map(([k, l]) => (
                <button key={k} className={`chip ${experience === k ? "on" : ""}`} onClick={() => setExperience(k)}>{l}</button>
              ))}
            </div>
            <h3 className="q mt">Matériel disponible</h3>
            <div className="grid3">
              {[["gym", "Salle complète"], ["limited", "Matériel limité"], ["home", "Maison / minimal"]].map(([k, l]) => (
                <button key={k} className={`chip ${equipment === k ? "on" : ""}`} onClick={() => setEquipment(k)}>{l}</button>
              ))}
            </div>
            <h3 className="q mt">Tes points faibles <span className="subtle">(jusqu'à 4 — le programme les ciblera)</span></h3>
            <div className="grid-st">
              {STATIONS.map((s) => (
                <button key={s.key} className={`chip sm ${weakStations.includes(s.key) ? "on" : ""}`} onClick={() => toggleWeak(s.key)}>{s.name}</button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="q">Combien de jours par semaine peux-tu t'entraîner&nbsp;?</h3>
            <div className="grid4">
              {[3, 4, 5, 6].map((d) => (
                <button key={d} className={`chip big ${daysPerWeek === d ? "on" : ""}`} onClick={() => setDays(d)}>
                  <span className="mono big-num">{d}</span><span>jours</span>
                </button>
              ))}
            </div>
            <div className="recap">
              <h4>Récapitulatif</h4>
              <ul>
                <li><MapPin size={13} /> {weeksFromDate ? Math.min(24, Math.max(2, weeksFromDate)) : "—"} semaines · {DIVISIONS[division].label}</li>
                <li><Target size={13} /> Objectif : {goal === "finir" ? "terminer" : goal === "temps" ? "temps cible" : "performance"}</li>
                <li><Footprints size={13} /> 5 km : {knows5k === "yes" ? (fiveKTime || "—") : `niveau ${runLevel}`}</li>
                <li><Dumbbell size={13} /> Force {strengthLevel}/5 · exp. {experience} · {equipment === "gym" ? "salle" : equipment === "limited" ? "matériel limité" : "maison"}</li>
                <li><Flame size={13} /> Points faibles : {weakStations.length ? weakStations.map((k) => STATIONS.find((s) => s.key === k).name).join(", ") : "aucun précisé"}</li>
                <li><Calendar size={13} /> {daysPerWeek} séances / semaine</li>
              </ul>
            </div>
          </>
        )}
      </div>

      <div className="wiz-nav">
        <button className="btn ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Retour</button>
        {step < STEPS.length - 1 ? (
          <button className="btn primary" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>Continuer <ArrowRight size={16} /></button>
        ) : (
          <button className="btn primary" onClick={submit}>Générer mon programme <Zap size={16} /></button>
        )}
      </div>
    </div>
  );
}

/* ---------------- Affichage d'une séance ---------------- */
function SessionCard({ s }) {
  const [open, setOpen] = useState(false);
  if (!s) return <div className="day rest"><span className="rest-label">Repos</span></div>;
  const { c, Icon, label } = CAT_STYLE[s.cat];
  return (
    <div className={`day ${open ? "open" : ""}`}>
      <button className="day-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="day-cat" style={{ background: c }}><Icon size={13} /></span>
        <span className="day-main">
          <span className="day-title">{s.title}</span>
          <span className="day-tag">{s.tag}</span>
        </span>
        <span className="day-dur mono">{s.duration}′</span>
        <ChevronDown size={16} className="day-chev" />
      </button>
      {open && (
        <div className="day-body">
          {s.blocks.map((b, i) => (
            <div key={i} className="block">
              <span className="block-label">{b.label}</span>
              <ul>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Affichage d'une semaine ---------------- */
function WeekCard({ wk, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`week ${open ? "open" : ""} ${wk.isRaceWeek ? "race" : ""}`}>
      <button className="week-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="week-num mono">S{pad(wk.number)}</span>
        <span className="week-info">
          <span className="phase-chip" style={{ "--ch": wk.color }}>{wk.phaseLabel}{wk.isDeload && " · récup"}{wk.isRaceWeek && " · 🏁"}</span>
          <span className="week-focus">{wk.focus}</span>
        </span>
        <span className="week-meta mono">{Math.round(wk.totalMin / 60 * 10) / 10} h</span>
        <ChevronDown size={18} className="day-chev" />
      </button>
      {open && (
        <div className="week-days">
          {wk.days.map((s, i) => (
            <div key={i} className="day-row">
              <span className="dow mono">{DAY_NAMES[i]}</span>
              <SessionCard s={s} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Vue programme ---------------- */
function ProgramView({ program, form, onRestart }) {
  const { division, z, weeks, totalWeeks, daysPerWeek } = program;
  const phaseSummary = useMemo(() => {
    const out = []; let cur = null;
    program.phaseSeq.forEach((k, i) => {
      if (!cur || cur.k !== k) { cur = { k, start: i + 1, end: i + 1 }; out.push(cur); } else cur.end = i + 1;
    });
    return out;
  }, [program.phaseSeq]);

  const [showWeights, setShowWeights] = useState(false);

  return (
    <div className="program">
      <div className="summary card">
        <div className="sum-top">
          <div>
            <span className="eyebrow">Ton plan personnalisé</span>
            <h2 className="sum-title">Route vers le départ</h2>
          </div>
          <div className="countdown">
            <span className="mono cd-num">{totalWeeks}</span>
            <span className="cd-label">semaines<br />avant la course</span>
          </div>
        </div>
        <RhythmStrip height={16} />
        <div className="sum-grid">
          <div className="sum-cell"><span className="sc-l">Division</span><span className="sc-v">{division.label}</span></div>
          <div className="sum-cell"><span className="sc-l">Séances / sem.</span><span className="sc-v mono">{daysPerWeek}</span></div>
          <div className="sum-cell"><span className="sc-l">Allure souple</span><span className="sc-v mono">{fmtPace(z.easy)}</span></div>
          <div className="sum-cell"><span className="sc-l">Allure tempo</span><span className="sc-v mono">{fmtPace(z.tempo)}</span></div>
          <div className="sum-cell"><span className="sc-l">Allure fractionné</span><span className="sc-v mono">{fmtPace(z.interval)}</span></div>
          <div className="sum-cell"><span className="sc-l">Allure course Hyrox</span><span className="sc-v mono">{fmtPace(z.hyrox)}</span></div>
        </div>
      </div>

      {/* Timeline des phases */}
      <div className="timeline card">
        <span className="eyebrow">Les 4 phases</span>
        <div className="tl-bar">
          {phaseSummary.map((p, i) => {
            const span = p.end - p.start + 1;
            return (
              <div key={i} className="tl-seg" style={{ flex: span, "--ch": PHASE_META[p.k].color }}>
                <span className="tl-name">{PHASE_META[p.k].label}</span>
                <span className="tl-weeks mono">S{p.start}{span > 1 ? `–${p.end}` : ""}</span>
              </div>
            );
          })}
        </div>
        <div className="tl-legend">
          {phaseSummary.map((p, i) => (
            <div key={i} className="tl-leg-item"><span className="dot" style={{ background: PHASE_META[p.k].color }} />{PHASE_META[p.k].label} — {PHASE_META[p.k].desc}</div>
          ))}
        </div>
      </div>

      {/* Poids de référence */}
      <div className="weights card">
        <button className="weights-head" onClick={() => setShowWeights((s) => !s)} aria-expanded={showWeights}>
          <span><Anchor size={15} /> Poids de référence · {division.label}</span>
          <ChevronDown size={16} className={`day-chev ${showWeights ? "rot" : ""}`} />
        </button>
        {showWeights && (
          <>
            <div className="weights-grid">
              <div className="wg"><span>Sled Push</span><b className="mono">{division.push}</b></div>
              <div className="wg"><span>Sled Pull</span><b className="mono">{division.pull}</b></div>
              <div className="wg"><span>Farmers Carry</span><b className="mono">{division.farmers}</b></div>
              <div className="wg"><span>Sandbag Lunges</span><b className="mono">{division.lunge}</b></div>
              <div className="wg"><span>Wall Balls</span><b className="mono">{division.wallball}</b></div>
              <div className="wg"><span>SkiErg / Rameur</span><b className="mono">1000 m</b></div>
            </div>
            <p className="hint subtle">Valeurs indicatives saison 2025/26 (poids du traîneau inclus). Les charges, hauteurs de cible et nombres de répétitions peuvent varier selon la saison et l'épreuve — vérifie toujours les standards officiels de ta course sur le site HYROX.</p>
          </>
        )}
      </div>

      <div className="weeks">
        {weeks.map((wk) => <WeekCard key={wk.number} wk={wk} defaultOpen={wk.number === 1} />)}
      </div>

      <div className="prog-actions">
        <button className="btn ghost" onClick={() => window.print()}><Printer size={15} /> Imprimer / PDF</button>
        <button className="btn primary" onClick={onRestart}><RotateCcw size={15} /> Recommencer</button>
      </div>
      <p className="hint subtle center">Le programme n'est pas enregistré — pense à l'imprimer ou le capturer. Ceci est un plan d'entraînement général, pas un avis médical : consulte un professionnel en cas de doute sur ta santé.</p>
    </div>
  );
}

/* ---------------- App ---------------- */
export default function App() {
  const [program, setProgram] = useState(null);
  const [form, setForm] = useState(null);
  const topRef = useRef(null);

  useEffect(() => {
    const id = "mhp-fonts";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap";
      document.head.appendChild(l);
    }
  }, []);

  const handleGenerate = (f) => { setForm(f); setProgram(generateProgram(f)); setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 50); };
  const restart = () => { setProgram(null); setForm(null); };

  return (
    <div className="mhp">
      <style>{CSS}</style>
      <header className="hero" ref={topRef}>
        <div className="hero-inner">
          <div className="brand">
            <span className="logo"><Activity size={18} /></span>
            <span className="brand-name">MyHyrox<span className="brand-accent">Prog</span></span>
          </div>
          {!program && (
            <>
              <h1 className="hero-title">Un programme<br /><span className="hl">taillé pour ton Hyrox.</span></h1>
              <p className="hero-sub">Tes allures, ta force, tes points faibles, ta date de course. On en fait un plan semaine par semaine, jour par jour — de la fondation à l'affûtage.</p>
              <RhythmStrip height={18} />
              <div className="hero-legend mono">8 km · 8 stations · 1 plan</div>
            </>
          )}
        </div>
      </header>

      <main className="main">
        {!program ? <Wizard onGenerate={handleGenerate} /> : <ProgramView program={program} form={form} onRestart={restart} />}
      </main>

      <footer className="foot">
        <RhythmStrip height={10} />
        <span>MyHyroxProg — générateur d'entraînement · les allures et charges sont des repères à ajuster à tes sensations.</span>
      </footer>
    </div>
  );
}

/* ============================ CSS ============================ */
const CSS = `
.mhp{
  --ink:#16181D; --ink-2:#23262F; --paper:#ECE9E0; --paper-2:#E2DED2;
  --card:#FBFAF6; --line:rgba(22,24,29,.12); --line-2:rgba(22,24,29,.07);
  --muted:#6B6F79; --cobalt:#2B4BEE; --orange:#F0531E;
  --accent:#E6FB47; --accent-deep:#B9C400; --accent-ink:#1A1C12;
  font-family:'Inter',system-ui,sans-serif; color:var(--ink);
  background:var(--paper); min-height:100%;
  -webkit-font-smoothing:antialiased;
}
.mhp *{box-sizing:border-box;}
.mhp .mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-feature-settings:"tnum";}
.mhp button{font-family:inherit;cursor:pointer;border:none;background:none;}

/* ---- Hero ---- */
.hero{background:var(--ink);color:#F4F2EA;padding:34px 20px 30px;}
.hero-inner{max-width:920px;margin:0 auto;}
.brand{display:flex;align-items:center;gap:9px;margin-bottom:26px;}
.logo{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:var(--accent);color:var(--accent-ink);}
.brand-name{font-family:'Archivo';font-weight:800;letter-spacing:-.02em;font-size:18px;}
.brand-accent{color:var(--accent);}
.hero-title{font-family:'Archivo';font-weight:900;line-height:.96;letter-spacing:-.03em;
  font-size:clamp(34px,7vw,62px);margin:0 0 16px;}
.hero-title .hl{color:var(--accent);}
.hero-sub{max-width:560px;color:#C7C8C2;font-size:16px;line-height:1.55;margin:0 0 24px;}
.hero-legend{margin-top:12px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#8B8D86;}

/* ---- Rhythm signature ---- */
.rhythm{display:flex;align-items:center;gap:3px;width:100%;}
.rhythm-run{flex:2;height:3px;border-radius:2px;background:currentColor;opacity:.32;}
.rhythm-station{flex:1;height:100%;border-radius:3px;background:var(--accent);}
.rhythm-finish{flex:1.4;background:var(--accent);opacity:1;height:4px;}
.hero .rhythm{color:#F4F2EA;}

/* ---- Layout ---- */
.main{max-width:920px;margin:-18px auto 0;padding:0 20px 60px;position:relative;}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;
  box-shadow:0 1px 0 rgba(0,0,0,.02),0 18px 40px -28px rgba(22,24,29,.4);}

/* ---- Wizard ---- */
.wizard{padding:0;overflow:hidden;}
.wiz-steps{display:flex;gap:4px;padding:16px 18px;border-bottom:1px solid var(--line-2);
  background:linear-gradient(var(--paper-2),transparent);flex-wrap:wrap;}
.wiz-step{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--muted);font-weight:500;
  padding:5px 10px;border-radius:99px;}
.wiz-step.on{color:var(--ink);background:#fff;border:1px solid var(--line);}
.wiz-step.done{color:var(--ink);}
.wiz-num{display:grid;place-items:center;width:19px;height:19px;border-radius:50%;background:var(--paper-2);
  font-size:11px;font-weight:700;font-family:'JetBrains Mono';}
.wiz-step.on .wiz-num{background:var(--accent);color:var(--accent-ink);}
.wiz-step.done .wiz-num{background:var(--cobalt);color:#fff;}
.wiz-body{padding:24px 22px;min-height:280px;}
.q{font-family:'Archivo';font-weight:800;letter-spacing:-.01em;font-size:18px;margin:0 0 13px;}
.q.mt{margin-top:26px;}
.q .subtle{font-weight:500;font-size:13px;color:var(--muted);font-family:'Inter';}
.field{display:block;margin-bottom:6px;}
.field-label{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:7px;}
.input{width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:11px;font-size:15px;background:#fff;color:var(--ink);}
.input:focus{outline:none;border-color:var(--cobalt);box-shadow:0 0 0 3px rgba(43,75,238,.13);}
.input.mono{letter-spacing:.04em;}
.hint{font-size:13px;color:var(--cobalt);margin:10px 0 0;line-height:1.5;}
.hint.warn{color:var(--orange);}
.hint.subtle{color:var(--muted);}
.hint.center{text-align:center;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.grid-st{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
@media(min-width:560px){.grid-st{grid-template-columns:repeat(4,1fr);}}
.chip{padding:12px 12px;border:1.5px solid var(--line);border-radius:11px;background:#fff;
  font-size:13.5px;font-weight:600;color:var(--ink);transition:.12s;text-align:center;}
.chip:hover{border-color:var(--ink);}
.chip.on{background:var(--ink);color:#F4F2EA;border-color:var(--ink);}
.chip.sm{padding:9px 8px;font-size:12.5px;}
.chip.big{display:flex;flex-direction:column;gap:2px;padding:16px 8px;}
.chip.big .big-num{font-size:24px;font-weight:700;}
.chip.big span:last-child{font-size:11px;color:inherit;opacity:.7;text-transform:uppercase;letter-spacing:.1em;}
.range-row{display:flex;align-items:center;gap:14px;}
.range{flex:1;accent-color:var(--cobalt);height:5px;}
.range-val{font-size:18px;font-weight:700;min-width:46px;}
.recap{margin-top:20px;padding:16px;background:var(--paper-2);border-radius:12px;}
.recap h4{margin:0 0 10px;font-family:'Archivo';font-size:13px;text-transform:uppercase;letter-spacing:.08em;}
.recap ul{list-style:none;margin:0;padding:0;display:grid;gap:8px;}
.recap li{display:flex;align-items:center;gap:9px;font-size:13.5px;color:var(--ink-2);}
.recap li svg{color:var(--cobalt);flex-shrink:0;}
.wiz-nav{display:flex;justify-content:space-between;padding:16px 22px;border-top:1px solid var(--line-2);background:var(--paper-2);}
.btn{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:11px;font-weight:700;font-size:14px;transition:.12s;}
.btn.primary{background:var(--accent);color:var(--accent-ink);}
.btn.primary:hover{filter:brightness(1.04);transform:translateY(-1px);}
.btn.primary:disabled{background:var(--paper-2);color:var(--muted);cursor:not-allowed;transform:none;}
.btn.ghost{background:#fff;border:1.5px solid var(--line);color:var(--ink);}
.btn.ghost:hover{border-color:var(--ink);}
.btn.ghost:disabled{opacity:.4;cursor:not-allowed;}

/* ---- Program summary ---- */
.program{display:flex;flex-direction:column;gap:14px;}
.summary{padding:22px;}
.sum-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:18px;}
.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:var(--muted);font-weight:700;}
.sum-title{font-family:'Archivo';font-weight:900;letter-spacing:-.02em;font-size:clamp(24px,5vw,34px);margin:4px 0 0;}
.countdown{display:flex;align-items:center;gap:10px;background:var(--ink);color:#F4F2EA;padding:10px 16px;border-radius:13px;}
.cd-num{font-size:34px;font-weight:700;color:var(--accent);line-height:1;}
.cd-label{font-size:10.5px;line-height:1.25;text-transform:uppercase;letter-spacing:.08em;color:#B9BAB3;}
.summary .rhythm{color:var(--ink);margin:6px 0 18px;}
.sum-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line-2);border:1px solid var(--line-2);border-radius:12px;overflow:hidden;}
@media(min-width:620px){.sum-grid{grid-template-columns:repeat(3,1fr);}}
.sum-cell{background:var(--card);padding:13px 14px;display:flex;flex-direction:column;gap:4px;}
.sc-l{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:600;}
.sc-v{font-size:16px;font-weight:700;}

/* ---- Timeline ---- */
.timeline{padding:20px 22px;}
.tl-bar{display:flex;gap:4px;margin:14px 0 16px;height:62px;}
.tl-seg{--ch:var(--ink);display:flex;flex-direction:column;justify-content:center;gap:3px;padding:0 12px;
  border-radius:10px;background:var(--ch);color:#fff;min-width:0;}
.tl-name{font-family:'Archivo';font-weight:800;font-size:13px;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tl-weeks{font-size:11px;opacity:.85;}
.tl-legend{display:grid;gap:7px;}
.tl-leg-item{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--ink-2);line-height:1.4;}
.dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}

/* ---- Weights ---- */
.weights{padding:0;overflow:hidden;}
.weights-head{width:100%;display:flex;justify-content:space-between;align-items:center;padding:16px 20px;font-weight:700;font-size:14.5px;}
.weights-head span{display:flex;align-items:center;gap:9px;}
.weights-head svg:first-child{color:var(--orange);}
.weights-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line-2);border-top:1px solid var(--line-2);}
@media(min-width:560px){.weights-grid{grid-template-columns:repeat(3,1fr);}}
.wg{background:var(--card);padding:13px 16px;display:flex;flex-direction:column;gap:3px;}
.wg span{font-size:12px;color:var(--muted);}
.wg b{font-size:15px;}
.weights .hint{padding:12px 20px 16px;margin:0;}
.day-chev.rot{transform:rotate(180deg);}

/* ---- Weeks ---- */
.weeks{display:flex;flex-direction:column;gap:9px;}
.week{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;transition:.15s;}
.week.open{box-shadow:0 14px 34px -26px rgba(22,24,29,.5);}
.week.race{border-color:var(--accent-deep);box-shadow:0 0 0 2px rgba(185,196,0,.25);}
.week-head{width:100%;display:flex;align-items:center;gap:14px;padding:15px 18px;text-align:left;}
.week-num{font-size:17px;font-weight:700;color:var(--muted);min-width:42px;}
.week.open .week-num{color:var(--ink);}
.week-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px;}
.phase-chip{--ch:var(--ink);align-self:flex-start;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;
  color:#fff;background:var(--ch);padding:2px 9px;border-radius:99px;}
.week-focus{font-size:13.5px;color:var(--ink-2);line-height:1.4;}
.week-meta{font-size:13px;color:var(--muted);font-weight:700;}
.day-chev{color:var(--muted);transition:transform .15s;flex-shrink:0;}
.week.open>.week-head .day-chev{transform:rotate(180deg);}

.week-days{padding:6px 14px 14px;display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line-2);}
.day-row{display:flex;gap:10px;align-items:stretch;}
.dow{flex-shrink:0;width:34px;padding-top:13px;font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;}
.day{flex:1;border:1px solid var(--line-2);border-radius:11px;background:#fff;overflow:hidden;min-width:0;}
.day.rest{display:flex;align-items:center;padding:11px 14px;background:var(--paper-2);border-style:dashed;}
.rest-label{font-size:13px;color:var(--muted);font-weight:600;}
.day-head{width:100%;display:flex;align-items:center;gap:11px;padding:11px 13px;text-align:left;}
.day-cat{display:grid;place-items:center;width:26px;height:26px;border-radius:7px;color:#fff;flex-shrink:0;}
.day-main{flex:1;display:flex;flex-direction:column;gap:1px;min-width:0;}
.day-title{font-weight:700;font-size:14px;}
.day-tag{font-size:11.5px;color:var(--muted);}
.day-dur{font-size:13px;font-weight:700;color:var(--ink-2);}
.day-body{padding:4px 14px 14px;border-top:1px solid var(--line-2);display:grid;gap:13px;}
.block-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--cobalt);}
.day.open .day-cat{box-shadow:0 0 0 3px rgba(0,0,0,.04);}
.block ul{margin:5px 0 0;padding-left:17px;display:grid;gap:4px;}
.block li{font-size:13.5px;line-height:1.45;color:var(--ink-2);}

/* ---- Program actions ---- */
.prog-actions{display:flex;gap:10px;justify-content:center;margin-top:10px;}

/* ---- Footer ---- */
.foot{max-width:920px;margin:0 auto;padding:24px 20px 40px;color:var(--muted);display:flex;flex-direction:column;gap:12px;}
.foot .rhythm{color:var(--muted);opacity:.6;}
.foot span{font-size:12px;line-height:1.5;}

/* ---- A11y / motion / print ---- */
.mhp :focus-visible{outline:2px solid var(--cobalt);outline-offset:2px;border-radius:6px;}
@media (prefers-reduced-motion:reduce){.mhp *{transition:none!important;}}
@media print{
  .hero,.foot,.prog-actions,.weights-head .day-chev{display:none!important;}
  .mhp{background:#fff;}
  .week,.day{break-inside:avoid;box-shadow:none!important;}
  .week-days{display:flex!important;}
}
`;
