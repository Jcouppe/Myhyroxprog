import React, { useState, useMemo, useEffect, useRef, useContext } from "react";
import {
  Activity, Calendar, ChevronDown, Dumbbell, Footprints, Timer,
  Target, Flame, RotateCcw, Printer, Wind, Anchor, ArrowRight, Check,
  MapPin, Gauge, Zap, Lock, User, LogOut, CheckCircle2, Circle,
  TrendingUp, Sparkles, X, MoreHorizontal, Undo2
} from "lucide-react";

/* =====================================================================
   i18n — système de langues (FR par défaut, EN en option)
   La clé de traduction EST le texte français ; si une entrée EN existe,
   elle est utilisée. Sinon on retombe sur le français (aucun texte cassé).
   ===================================================================== */
const LangContext = React.createContext("fr");
const I18N = { en: {
  // Nav
  "Se connecter": "Sign in", "Commencer": "Start", "Déconnexion": "Sign out",
  "Mon programme": "My program", "Retour à l'accueil": "Back to home",
  // Landing
  "Programme généré sur-mesure": "Custom-built program",
  "Ton plan Hyrox,": "Your Hyrox plan,", "calé sur tes chiffres.": "built on your numbers.",
  "Renseigne tes allures, ta force et tes temps par atelier. On calcule tes facteurs limitants et on construit un programme semaine par semaine, jour par jour — de la fondation à l'affûtage.": "Enter your paces, your strength and your station times. We compute your limiting factors and build a program week by week, day by day — from base to taper.",
  "Générer mon programme": "Generate my program",
  "Première semaine offerte · sans carte": "First week free · no card",
  "8 km · 8 stations · 1 plan": "8 km · 8 stations · 1 plan",
  "Fondation": "Base", "Développement": "Build", "Spécifique": "Specific", "Affûtage": "Taper",
  "Semaines 2 → 12": "Weeks 2 → 12",
  "Facteurs limitants": "Limiting factors",
  "Tes temps par atelier révèlent ce qui te coûte le plus. Le plan attaque ces points en priorité.": "Your station times reveal what costs you most. The plan targets those first.",
  "Allures calculées": "Calculated paces",
  "À partir de ton 5 km ou de ta course Hyrox, chaque séance reçoit son allure précise.": "From your 5 km or your Hyrox race, every session gets its exact pace.",
  "Semaine par semaine": "Week by week",
  "Une vraie périodisation : fondation, développement, spécifique, affûtage jusqu'au jour J.": "Real periodization: base, build, specific, taper up to race day.",
  "Suivi des séances": "Session tracking",
  "Coche chaque séance réalisée et garde le fil de ta progression jusqu'à la course.": "Tick off each completed session and follow your progress to race day.",
  "Comment ça marche": "How it works",
  "Tes données": "Your data", "Allures, force, matériel, temps Hyrox par atelier.": "Paces, strength, gear, Hyrox station times.",
  "L'analyse": "The analysis", "On situe ton niveau et tes facteurs limitants.": "We pinpoint your level and your limiting factors.",
  "Ton plan": "Your plan", "Un programme daté, ajusté chaque semaine jusqu'à la course.": "A dated program, adjusted every week up to the race.",
  "Commencer maintenant": "Start now",
  // Wizard steps
  "La course": "The race", "Course à pied": "Running", "Performances": "Performance",
  "Force & matériel": "Strength & gear", "Disponibilité": "Availability",
  "Construisons ton programme": "Let's build your program",
  "Retour": "Back", "Continuer": "Continue",
  // Wizard content
  "Quand a lieu ta course ?": "When is your race?",
  "Choisir une épreuve": "Pick an event", "Saisir une date": "Enter a date",
  "Épreuve HYROX": "HYROX event", "— Sélectionne ton épreuve —": "— Select your event —",
  "Date de l'épreuve": "Race date",
  "Ta division": "Your division", "Ton objectif": "Your goal",
  "Terminer": "Finish", "Temps cible": "Target time", "Performance": "Performance",
  "Femme — Open": "Women — Open", "Homme — Open": "Men — Open", "Femme — Pro": "Women — Pro", "Homme — Pro": "Men — Pro",
  "Connais-tu ton temps sur 5 km ?": "Do you know your 5 km time?",
  "Oui": "Yes", "Non, j'estime": "No, estimate it",
  "Temps sur 5 km (mm:ss)": "5 km time (mm:ss)", "Format mm:ss, ex. 24:30": "Format mm:ss, e.g. 24:30",
  "Mon niveau en course": "My running level",
  "Débutant (~30 min)": "Beginner (~30 min)", "Intermédiaire (~25 min)": "Intermediate (~25 min)",
  "Confirmé (~21 min)": "Advanced (~21 min)", "Rapide (~18 min)": "Fast (~18 min)",
  "Sert à calculer toutes tes allures d'entraînement.": "Used to compute all your training paces.",
  "As-tu déjà fait un Hyrox ?": "Have you done a Hyrox before?",
  "Tes temps réels affinent le plan et révèlent tes facteurs limitants.": "Your real times refine the plan and reveal your limiting factors.",
  "Pas encore": "Not yet",
  "Temps final (mm:ss ou h:mm)": "Finish time (mm:ss or h:mm)",
  "Allure moyenne des runs (/km)": "Average run pace (/km)",
  "Renseigne au moins 2 ateliers pour activer la détection automatique des facteurs limitants.": "Enter at least 2 stations to enable automatic limiting-factor detection.",
  "Ton niveau de force": "Your strength level",
  "Expérience fitness fonctionnel": "Functional fitness experience",
  "Débutant": "Beginner", "Intermédiaire": "Intermediate", "Avancé": "Advanced",
  "Matériel disponible": "Available gear", "Salle complète": "Full gym", "Matériel limité": "Limited gear", "Maison": "Home",
  "Tractions max (reps)": "Max pull-ups (reps)", "Burpees en 1 min": "Burpees in 1 min",
  "Si tu les renseignes, les séances de force afficheront les charges exactes (% de ton 1RM) et le volume de tractions sera calé sur ton max. Sinon, le programme reste en repères « lourd / 4×5 ».": "If you fill these in, strength sessions will show exact loads (% of your 1RM) and pull-up volume will scale to your max. Otherwise the program stays in 'heavy / 4×5' cues.",
  "Combien de jours par semaine ?": "How many days per week?", "jours": "days",
  "Récapitulatif": "Summary", "semaines": "weeks",
  "Force": "Strength", "salle": "gym", "limité": "limited", "maison": "home",
  // Levels / intensity / phases labels
  "Débutant ": "Beginner", "Confirmé": "Advanced", "Élite": "Elite",
  "Très allégé": "Much lighter", "Allégé": "Lighter", "Standard": "Standard", "Soutenu": "Hard", "Très soutenu": "Very hard",
  // Dashboard
  "Ton plan personnalisé": "Your personalized plan", "Route vers le départ": "Road to the start",
  "semaines avant la course": "weeks to race", "Progression": "Progress", "séances": "sessions",
  "Division": "Division", "Intensité actuelle": "Current intensity", "Séances / sem.": "Sessions / wk",
  "Allure souple": "Easy pace", "Allure tempo": "Tempo pace", "Allure fractionné": "Interval pace", "Allure course Hyrox": "Hyrox race pace",
  "Ton niveau de course": "Your running level", "VMA estimée": "Estimated vVO₂max",
  "5 km estimé": "Estimated 5 km", "Allure 5 km": "5 km pace", "vs médiane division": "vs division median",
  "Les 4 phases": "The 4 phases",
  "Poids de référence": "Reference weights",
  "Tes facteurs limitants": "Your limiting factors", "point faible": "weak point",
  "Imprimer / PDF": "Print / PDF", "Nouveau programme": "New program",
  "Débloquer": "Unlock", "Débloquer le programme": "Unlock the program", "Débloque tout ton plan": "Unlock your whole plan",
  "Réajuster mon plan": "Re-tune my plan", "Ressenti :": "How it felt:",
  "Trop facile": "Too easy", "Parfait": "Just right", "Trop dur": "Too hard",
  // Modals
  "Connexion à ton espace": "Sign in to your space",
  "Ton programme et tes séances cochées sont gardés sur cet appareil.": "Your program and ticked sessions are kept on this device.",
  "Prénom": "First name", "E-mail": "Email",
  "Programme complet": "Full program", "/ mois": "/ month",
  "Toutes les semaines jusqu'à ta course": "Every week up to your race",
  "Suivi des séances et progression": "Session tracking and progress",
  "Allures et facteurs limitants détaillés": "Detailed paces and limiting factors",
  // Footer
  "MyHyroxProg — générateur d'entraînement · allures et charges sont des repères à ajuster à tes sensations.": "MyHyroxProg — training generator · paces and loads are guides to adjust to how you feel.",
  // EN-mode note
  "Les détails des séances sont affichés en français pour l'instant — leur traduction arrive très bientôt.": "Session details are shown in French for now — their translation is coming very soon.",
  // Wizard — Hyrox passé (solo Open/Pro)
  "As-tu déjà fait un Hyrox en solo ?": "Have you done a solo Hyrox before?",
  "Tes temps réels affinent le plan et révèlent tes facteurs limitants. Solo uniquement : les temps en duo ou relais ne sont pas comparables.": "Your real times refine the plan and reveal your limiting factors. Solo only: doubles or relay times aren't comparable.",
  "Oui, en solo": "Yes, solo", "Format de ta course solo": "Your solo race format",
  "Solo Open": "Solo Open", "Solo Pro": "Solo Pro",
  "Tes temps seront comparés aux médianes de cette division pour situer tes points faibles.": "Your times will be compared to this division's medians to locate your weak points.",
  "Tes temps par atelier": "Your station times", "(facultatif, mm:ss)": "(optional, mm:ss)", "(jusqu'à 4)": "(up to 4)",
  "Soulevé de terre": "Deadlift", "Développé couché": "Bench press",
  "semaine": "week", "avant la course": "to race", "Rameur": "Rower", "récup": "deload",
  "Ton épreuve n'est pas listée (date pas encore publiée) ?": "Event not listed (date not published yet)?",
  "Trouve-la sur le calendrier officiel": "Find it on the official calendar",
  "puis saisis la date à la main.": "then enter the date manually.",
  // Phases
  "On bâtit le moteur aérobie et la base de force.": "Build the aerobic engine and strength base.",
  "Montée en intensité, force et premières simulations.": "Rising intensity, strength and first simulations.",
  "On devient Hyrox : course fatiguée et simulations.": "Becoming Hyrox: running fatigued and simulations.",
  "On réduit le volume, on garde le tranchant. Jour J.": "Cut volume, keep the edge. Race day.",
  // Days
  "Lun": "Mon", "Mar": "Tue", "Mer": "Wed", "Jeu": "Thu", "Ven": "Fri", "Sam": "Sat", "Dim": "Sun",
  // Run level hints
  "Ta course est un atout : sur Hyrox, courir plus vite que la médiane fait gagner de précieuses minutes (la course = ~51 % du temps total).": "Running is an asset: in Hyrox, running faster than the median saves precious minutes (running ≈ 51% of total time).",
  "La course est ton plus gros levier : ~51 % du temps total se joue sur les 8 km. Le plan met l'accent sur le volume facile et l'allure cible.": "Running is your biggest lever: ~51% of total time is on the 8 km. The plan emphasizes easy volume and target pace.",
  "Niveau estimé depuis ta catégorie déclarée — renseigne ton temps sur 5 km pour plus de précision.": "Level estimated from your declared category — enter your 5 km time for more accuracy.",
  // Limiters
  "Basés sur tes points faibles ressentis :": "Based on your perceived weak points:",
  "aucun précisé": "none specified",
  "Renseigne tes temps par atelier (étape Performances) pour une détection automatique précise.": "Enter your station times (Performance step) for accurate automatic detection.",
  "Tu perds surtout du temps en course : priorité au volume et à la course fatiguée.": "You lose most time on the run: priority on volume and running fatigued.",
  "Tu perds surtout sur les ateliers : priorité à la force et aux simulations.": "You lose most on the stations: priority on strength and simulations.",
  "Course et ateliers sont équilibrés : on travaille les deux.": "Running and stations are balanced: we train both.",
  "Le programme attaque en priorité :": "The program targets first:",
  "Écart par rapport à la médiane estimée de ta division (− = plus rapide, + = plus lent). Tes points faibles sont les ateliers où tu es le plus en retard par rapport à ton propre niveau moyen, pas dans l'absolu. Médianes indicatives issues d'analyses publiques de résultats HYROX — à affiner.": "Gap vs your division's estimated median (− = faster, + = slower). Your weak points are the stations where you lag most relative to your own average level, not in absolute terms. Indicative medians from public HYROX results analyses — to refine.",
  // Session card
  "Repos": "Rest", "Décocher": "Uncheck", "Marquer comme fait": "Mark as done",
  // Week card
  "Débloque le programme complet pour voir cette semaine": "Unlock the full program to see this week",
  // Dashboard dynamic
  "Cap sur {city}": "Heading to {city}",
  "Tes retours montrent que c'est trop facile ({n} séances faciles). On peut monter l'intensité d'un cran.": "Your feedback shows it's too easy ({n} easy sessions). We can raise intensity one notch.",
  "Tes retours montrent que c'est trop dur ({n} séances dures). On peut alléger d'un cran.": "Your feedback shows it's too hard ({n} hard sessions). We can ease off one notch.",
  "Retours pris en compte : intensité « {lvl} » bien calée pour l'instant.": "Feedback noted: intensity '{lvl}' is well set for now.",
  "Semaine 1 offerte. Débloque les {n} semaines suivantes + le suivi complet.": "Week 1 free. Unlock the next {n} weeks + full tracking.",
  "Valeurs indicatives saison 2025/26 (poids du traîneau inclus). Vérifie toujours les standards officiels de ta course sur le site HYROX.": "Indicative values for the 2025/26 season (sled weight included). Always check your race's official standards on the HYROX site.",
  "Programme sauvegardé sur cet appareil. Plan d'entraînement général, pas un avis médical : en cas de doute, consulte un professionnel.": "Program saved on this device. General training plan, not medical advice: if in doubt, consult a professional.",
  // Modals extra
  "Prototype : aucune donnée n'est envoyée sur internet. La connexion multi-appareils arrivera avec la version sécurisée.": "Prototype: no data is sent online. Multi-device sign-in will come with the secure version.",
  "La semaine 1 est offerte. Débloque les semaines suivantes, le suivi complet et les ajustements jusqu'au jour J.": "Week 1 is free. Unlock the following weeks, full tracking and adjustments up to race day.",
  "Prototype : le déblocage est simulé sur cet appareil. Le paiement réel (Stripe) sera branché à l'étape suivante.": "Prototype: unlocking is simulated on this device. Real payment (Stripe) will be wired in the next step.",
  // Export agenda
  "Ajouter à mon agenda (.ics)": "Add to my calendar (.ics)",
  "Fichier .ics : sur iPhone/Mac il s'ouvre dans Apple Calendrier ; pour Google Agenda, importe le fichier (Paramètres → Importer). Les séances apparaissent aux bonnes dates jusqu'à ta course.": "An .ics file: on iPhone/Mac it opens in Apple Calendar; for Google Calendar, import the file (Settings → Import). Sessions appear on the right dates up to your race.",
  // Reporter / Sauter
  "Options": "Options", "Reporter": "Postpone", "Sauter": "Skip",
  "Séance sautée": "Skipped session", "Annuler": "Undo",
} };
function tr(lang, s, vars) {
  let out = (lang === "en" && I18N.en[s] !== undefined) ? I18N.en[s] : s;
  if (vars) for (const k in vars) out = out.split("{" + k + "}").join(vars[k]);
  return out;
}
function useT() { const lang = useContext(LangContext); return (s, vars) => tr(lang, s, vars); }
/* helper bilingue pour le contenu généré des séances */
const loc = (lang, fr, en) => lang === "en" ? en : fr;


/* =====================================================================
   MyHyroxProg v2 — générateur de programme Hyrox personnalisé
   Refonte UI + facteurs limitants + paywall + suivi + sauvegarde locale.
   NB : compte & paiement simulés localement (prototype). La version
   sécurisée (multi-appareils + paiement réel) nécessite Supabase + Stripe.
   ===================================================================== */

/* ---------- Stockage local (sans planter dans l'aperçu sandbox) ---------- */
const store = {
  get(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

/* ---------- Les 8 stations (avec temps de référence indicatifs, en s) ---------- */
const STATIONS = [
  { key: "ski",      name: "SkiErg",            spec: "1000 m",   ref: 270, group: "Haut du corps / tirage" },
  { key: "sledpush", name: "Sled Push",         spec: "50 m",     ref: 115, group: "Jambes / poussée" },
  { key: "sledpull", name: "Sled Pull",         spec: "50 m",     ref: 120, group: "Dos / tirage / jambes" },
  { key: "burpee",   name: "Burpee Broad Jump", spec: "80 m",     ref: 235, group: "Conditionnement explosif" },
  { key: "row",      name: "Rameur",            spec: "1000 m",   ref: 245, group: "Endurance corps entier" },
  { key: "farmers",  name: "Farmers Carry",     spec: "200 m",    ref: 95,  group: "Grip / gainage" },
  { key: "lunge",    name: "Sandbag Lunges",    spec: "100 m",    ref: 230, group: "Jambes / gainage" },
  { key: "wallball", name: "Wall Balls",        spec: "100 reps", ref: 300, group: "Squat-endurance / épaules" },
];
const RUN_REF = 330; // s/km indicatif d'un run Hyrox (mi-peloton)

const DIVISIONS = {
  femme_open: { label: "Femme — Open", gender: "F", pro: false, push: "102 kg", pull: "78 kg", farmers: "2 × 16 kg", lunge: "sac 10 kg", wallball: "4 kg → 2,70 m" },
  homme_open: { label: "Homme — Open", gender: "H", pro: false, push: "152 kg", pull: "103 kg", farmers: "2 × 24 kg", lunge: "sac 20 kg", wallball: "6 kg → 3,00 m" },
  femme_pro:  { label: "Femme — Pro",  gender: "F", pro: true,  push: "152 kg", pull: "103 kg", farmers: "2 × 24 kg", lunge: "sac 20 kg", wallball: "6 kg → 2,70 m" },
  homme_pro:  { label: "Homme — Pro",  gender: "H", pro: true,  push: "202 kg", pull: "153 kg", farmers: "2 × 32 kg", lunge: "sac 30 kg", wallball: "9 kg → 3,00 m" },
};

/* ---------- Épreuves HYROX confirmées (instantané — à rafraîchir) ----------
   Source : calendrier officiel hyrox.com. Date = 1er jour de l'épreuve.
   Beaucoup d'épreuves de la nouvelle saison ne sont pas encore datées :
   le bouton "Trouver mon épreuve" renvoie vers le calendrier officiel. */
const EVENTS = [
  { region: "Europe / EMEA", city: "Athènes", country: "Grèce", date: "2026-09-05" },
  { region: "Europe / EMEA", city: "Istanbul", country: "Turquie", date: "2026-08-01" },
  { region: "Europe / EMEA", city: "Utrecht", country: "Pays-Bas", date: "2026-11-26" },
  { region: "Amériques", city: "Washington DC", country: "USA", date: "2026-09-03" },
  { region: "Amériques", city: "Salt Lake City", country: "USA", date: "2026-09-18" },
  { region: "Amériques", city: "Acapulco", country: "Mexique", date: "2026-09-05" },
  { region: "Amériques", city: "Rio de Janeiro", country: "Brésil", date: "2026-11-21" },
  { region: "Asie-Pacifique", city: "Jakarta", country: "Indonésie", date: "2026-06-27" },
  { region: "Asie-Pacifique", city: "Sydney", country: "Australie", date: "2026-07-01" },
  { region: "Asie-Pacifique", city: "Hangzhou", country: "Chine", date: "2026-07-04" },
  { region: "Asie-Pacifique", city: "New Delhi", country: "Inde", date: "2026-07-24" },
  { region: "Asie-Pacifique", city: "Chengdu", country: "Chine", date: "2026-08-01" },
  { region: "Asie-Pacifique", city: "Chiba", country: "Japon", date: "2026-08-06" },
  { region: "Asie-Pacifique", city: "Bangkok", country: "Thaïlande", date: "2026-08-13" },
  { region: "Asie-Pacifique", city: "Shenzhen", country: "Chine", date: "2026-08-15" },
  { region: "Asie-Pacifique", city: "Perth", country: "Australie", date: "2026-08-21" },
  { region: "Asie-Pacifique", city: "Mumbai", country: "Inde", date: "2026-09-18" },
  { region: "Asie-Pacifique", city: "Beijing", country: "Chine", date: "2026-09-12" },
  { region: "Afrique", city: "Le Cap", country: "Afrique du Sud", date: "2026-08-14" },
];
const FRENCH_MONTHS = ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."];
function fmtEventDate(iso) { const d = new Date(iso + "T00:00:00"); return `${d.getDate()} ${FRENCH_MONTHS[d.getMonth()]} ${d.getFullYear()}`; }
const EVENT_REGIONS = ["Europe / EMEA", "Amériques", "Asie-Pacifique", "Afrique"];

/* ---------- Médianes de référence par division (en secondes) ----------
   Sources : analyses publiques de résultats HYROX (HYROX Insider, HyroxDataLab),
   recalées sur des cas réels. Valeurs indicatives — Pro = estimation (données plus rares).
   Clés : ski, sledpush, sledpull, burpee, row, farmers, lunge, wallball, run (par km). */
const REF = {
  homme_open: { ski: 270, sledpush: 230, sledpull: 245, burpee: 300, row: 270, farmers: 140, lunge: 270, wallball: 345, run: 345 },
  femme_open: { ski: 300, sledpush: 240, sledpull: 250, burpee: 330, row: 300, farmers: 145, lunge: 300, wallball: 345, run: 380 },
  homme_pro:  { ski: 255, sledpush: 285, sledpull: 270, burpee: 285, row: 255, farmers: 150, lunge: 290, wallball: 350, run: 315 },
  femme_pro:  { ski: 285, sledpush: 270, sledpull: 265, burpee: 315, row: 285, farmers: 150, lunge: 300, wallball: 350, run: 350 },
};

/* ---------- Table de correspondance %1RM → répétitions (fournie) ---------- */
const RM_TABLE = [[1,100],[2,96.9],[3,93.1],[4,89.8],[5,87.4],[6,85.8],[7,82.9],[8,80.4],[9,78.6],[10,76.2],[15,70],[22,65],[25,60],[45,50],[90,40],[125,30]];
function pctForReps(r) { let best = RM_TABLE[0]; for (const e of RM_TABLE) if (Math.abs(e[0] - r) < Math.abs(best[0] - r)) best = e; return best[1]; }
const round25 = (x) => Math.round(x / 2.5) * 2.5;
/* charge calculée pour un 1RM donné et un nombre de reps ; null si pas de 1RM */
function loadFor(oneRM, reps, adj = 0, factor = 1) {
  if (factor === null) return null; // variante sans charge calculée (poids du corps, goblet, etc.)
  const v = Number(oneRM);
  if (!v || isNaN(v)) return null;
  const pct = pctForReps(reps);
  const kg = round25(v * pct / 100 * (1 + 0.025 * adj) * factor);
  return factor === 1 ? `${kg} kg (≈${Math.round(pct)} %)` : `≈ ${kg} kg`;
}

/* ---------- Temps / allures ---------- */
const pad = (n) => String(n).padStart(2, "0");
const secToMMSS = (s) => `${Math.floor(s / 60)}:${pad(Math.round(s % 60))}`;
function mmssToSec(str) {
  if (str === undefined || str === null || str === "") return null;
  const m = String(str).trim().match(/^(\d{1,3})[:.](\d{1,2})$/);
  if (!m) { const n = Number(str); return isNaN(n) ? null : n * 60; }
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
const fmtPace = (s) => `${secToMMSS(s)} /km`;
const RUN_LEVEL_5K = { debutant: 1800, intermediaire: 1500, confirme: 1260, rapide: 1080 };

function paceZones(fiveKsec, hyroxRunSec, adj = 0) {
  const p = fiveKsec / 5;
  const m = Math.min(1.1, Math.max(0.9, 1 - 0.02 * adj)); // adj>0 (trop facile) → plus rapide
  return {
    p5k: p,
    easy: (p + 70) * m, long: (p + 55) * m, tempo: (p + 22) * m, threshold: (p + 12) * m,
    interval: Math.max(p - 6, 165) * m,
    hyrox: (hyroxRunSec || p + 38) * m,
  };
}

/* ---------- Phases ---------- */
function buildPhases(totalWeeks) {
  let taper = totalWeeks >= 10 ? 2 : 1; if (totalWeeks <= 4) taper = 1;
  const work = Math.max(1, totalWeeks - taper);
  let base = Math.max(1, Math.round(work * 0.3)), specific = Math.max(1, Math.round(work * 0.3));
  let build = work - base - specific;
  while (build < 1) { if (base > 1) base--; else if (specific > 1) specific--; build = work - base - specific; }
  const seq = [];
  for (let i = 0; i < base; i++) seq.push("base");
  for (let i = 0; i < build; i++) seq.push("build");
  for (let i = 0; i < specific; i++) seq.push("specific");
  for (let i = 0; i < taper; i++) seq.push("taper");
  return seq.slice(0, totalWeeks);
}
const PHASE_META = {
  base:     { label: "Fondation",     color: "var(--cobalt)",      desc: "On bâtit le moteur aérobie et la base de force." },
  build:    { label: "Développement", color: "var(--ink)",         desc: "Montée en intensité, force et premières simulations." },
  specific: { label: "Spécifique",    color: "var(--orange)",      desc: "On devient Hyrox : course fatiguée et simulations." },
  taper:    { label: "Affûtage",      color: "var(--accent-deep)", desc: "On réduit le volume, on garde le tranchant. Jour J." },
};

/* ---------- Matériel ---------- */
function equipAlt(mvt, equip, lang) {
  const G = equip === "gym", L = equip === "limited";
  switch (mvt) {
    case "squat":    return G ? loc(lang, "Back squat (barre)", "Back squat (barbell)") : L ? loc(lang, "Goblet squat (haltère/kettlebell)", "Goblet squat (dumbbell/kettlebell)") : loc(lang, "Squat poids du corps + sac à dos lesté / squat bulgare", "Bodyweight squat + loaded backpack / Bulgarian split squat");
    case "hinge":    return G ? loc(lang, "Soulevé de terre / RDL (barre)", "Deadlift / RDL (barbell)") : L ? loc(lang, "RDL haltères / swings kettlebell", "Dumbbell RDL / kettlebell swings") : loc(lang, "RDL unijambe + soulevé sac lesté", "Single-leg RDL + loaded bag lift");
    case "press":    return G ? loc(lang, "Développé épaules (barre/haltères)", "Shoulder press (barbell/dumbbells)") : L ? loc(lang, "Développé haltères / pompes lestées", "Dumbbell press / weighted push-ups") : loc(lang, "Pompes (variantes) + développé sac lesté", "Push-ups (variations) + loaded bag press");
    case "pull":     return G ? loc(lang, "Tractions / tirage horizontal", "Pull-ups / horizontal row") : L ? loc(lang, "Tractions / rowing haltères", "Pull-ups / dumbbell rows") : loc(lang, "Tractions (barre/élastique) + rowing élastique", "Pull-ups (bar/band) + band rows");
    case "ski":      return G ? "SkiErg" : L ? loc(lang, "Swings + battle ropes", "Swings + battle ropes") : loc(lang, "Swings sac lesté + planche dynamique", "Loaded-bag swings + dynamic plank");
    case "row":      return G ? loc(lang, "Rameur", "Rowing") : L ? loc(lang, "Vélo / corde à sauter", "Bike / jump rope") : loc(lang, "Burpees rythmés / corde à sauter", "Paced burpees / jump rope");
    case "sledpush": return G ? loc(lang, "Sled push / prowler", "Sled push / prowler") : L ? loc(lang, "Poussée traîneau ou montées en côte", "Sled push or hill repeats") : loc(lang, "Tapis incliné rapide / fentes marchées lestées / sprints en côte", "Fast incline treadmill / loaded walking lunges / hill sprints");
    case "sledpull": return G ? loc(lang, "Sled pull (corde)", "Sled pull (rope)") : L ? loc(lang, "Tirage corde / rameur lourd", "Rope pull / heavy rowing") : loc(lang, "Tirage élastique lourd + rowing", "Heavy band pulls + rows");
    case "wallball": return G || L ? loc(lang, "Wall balls (medecine ball + mur)", "Wall balls (medicine ball + wall)") : loc(lang, "Thrusters lestés face à une cible haute", "Loaded thrusters to a high target");
    case "farmers":  return G ? loc(lang, "Farmers carry (haltères/kettlebells)", "Farmers carry (dumbbells/kettlebells)") : L ? loc(lang, "Port de charges (haltères/kettlebells)", "Loaded carries (dumbbells/kettlebells)") : loc(lang, "Port de jerricans / sac à dos lesté", "Jerry-can carries / loaded backpack");
    case "lunge":    return G || L ? loc(lang, "Fentes marchées avec sandbag", "Walking lunges with sandbag") : loc(lang, "Fentes marchées + sac à dos lesté", "Walking lunges + loaded backpack");
    default: return mvt;
  }
}
function stationDrill(key, w, equip, lang) {
  switch (key) {
    case "ski":      return `${equipAlt("ski", equip, lang)} — ${loc(lang, "4 × 250 m, départ explosif, rythme régulier", "4 × 250 m, explosive start, steady rhythm")}`;
    case "sledpush": return `${equipAlt("sledpush", equip, lang)} — ${loc(lang, `6 × 15 m lourd (≈ ${w.push}), petits pas, dos gainé`, `6 × 15 m heavy (≈ ${w.push}), short steps, braced back`)}`;
    case "sledpull": return `${equipAlt("sledpull", equip, lang)} — ${loc(lang, `6 × 15 m (≈ ${w.pull}), hanches basses`, `6 × 15 m (≈ ${w.pull}), hips low`)}`;
    case "burpee":   return loc(lang, "Burpee broad jumps — 5 × 10, rester bas, sauter loin, respiration calme", "Burpee broad jumps — 5 × 10, stay low, jump far, calm breathing");
    case "row":      return `${equipAlt("row", equip, lang)} — ${loc(lang, "4 × 300 m allure cible, tirage jambes→dos→bras", "4 × 300 m target pace, drive legs→back→arms")}`;
    case "farmers":  return `${equipAlt("farmers", equip, lang)} — ${loc(lang, `4 × 50 m (≈ ${w.farmers}), grip ferme, pas rapides`, `4 × 50 m (≈ ${w.farmers}), firm grip, quick steps`)}`;
    case "lunge":    return `${equipAlt("lunge", equip, lang)} — ${loc(lang, `4 × 25 m (${w.lunge}), genou au sol, buste droit`, `4 × 25 m (${w.lunge}), knee to floor, torso tall`)}`;
    case "wallball": return `${equipAlt("wallball", equip, lang)} — ${loc(lang, `5 × 20 (${w.wallball}), squat complet, lancer dans le rythme`, `5 × 20 (${w.wallball}), full squat, throw in rhythm`)}`;
    default: return "";
  }
}

/* ---------- Variantes d'exercices (rotation hebdomadaire pour éviter la redondance) ----------
   f = facteur de charge vs le 1RM saisi (1 = lift de référence, null = pas de kg affiché). */
const LIFT_VARIANTS = {
  squat: {
    gym: [
      { fr: "Back squat (barre)", en: "Back squat (barbell)", f: 1 },
      { fr: "Front squat (barre)", en: "Front squat (barbell)", f: 0.82 },
      { fr: "Box squat (barre)", en: "Box squat (barbell)", f: 0.95 },
      { fr: "Back squat tempo (3-1-1)", en: "Tempo back squat (3-1-1)", f: 0.78 },
    ],
    limited: [
      { fr: "Goblet squat lourd (kettlebell/haltère)", en: "Heavy goblet squat (kettlebell/dumbbell)", f: null },
      { fr: "Squat bulgare (haltères)", en: "Bulgarian split squat (dumbbells)", f: null },
      { fr: "Goblet squat tempo", en: "Tempo goblet squat", f: null },
    ],
    home: [
      { fr: "Squat bulgare lesté (sac à dos)", en: "Loaded Bulgarian split squat (backpack)", f: null },
      { fr: "Squat sauté + squat poids du corps", en: "Jump squat + bodyweight squat", f: null },
      { fr: "Squat pistol assisté", en: "Assisted pistol squat", f: null },
    ],
  },
  hinge: {
    gym: [
      { fr: "Soulevé de terre (barre)", en: "Deadlift (barbell)", f: 1 },
      { fr: "Soulevé de terre roumain (RDL)", en: "Romanian deadlift (RDL)", f: 0.85 },
      { fr: "Soulevé trap-bar", en: "Trap-bar deadlift", f: 1.05 },
      { fr: "Soulevé sumo", en: "Sumo deadlift", f: 1 },
    ],
    limited: [
      { fr: "RDL haltères", en: "Dumbbell RDL", f: null },
      { fr: "Swings kettlebell lourds", en: "Heavy kettlebell swings", f: null },
      { fr: "Good morning (élastique/haltère)", en: "Band/dumbbell good morning", f: null },
    ],
    home: [
      { fr: "RDL unijambe (sac lesté)", en: "Single-leg RDL (loaded bag)", f: null },
      { fr: "Pont fessier lesté", en: "Loaded glute bridge", f: null },
      { fr: "Good morning (sac lesté)", en: "Loaded-bag good morning", f: null },
    ],
  },
  press: {
    gym: [
      { fr: "Développé militaire (barre)", en: "Strict press (barbell)", f: 1 },
      { fr: "Push press", en: "Push press", f: 1.2 },
      { fr: "Développé épaules haltères", en: "Dumbbell shoulder press", f: 0.85 },
      { fr: "Z-press", en: "Z-press", f: 0.8 },
    ],
    limited: [
      { fr: "Développé haltères debout", en: "Standing dumbbell press", f: null },
      { fr: "Pompes lestées", en: "Weighted push-ups", f: null },
      { fr: "Push press haltères", en: "Dumbbell push press", f: null },
    ],
    home: [
      { fr: "Pompes pieds surélevés", en: "Feet-elevated push-ups", f: null },
      { fr: "Pike push-ups", en: "Pike push-ups", f: null },
      { fr: "Développé sac lesté", en: "Loaded-bag press", f: null },
    ],
  },
  pull: {
    gym: [
      { fr: "Tractions", en: "Pull-ups", f: null },
      { fr: "Rowing barre (Pendlay)", en: "Barbell row (Pendlay)", f: null },
      { fr: "Tirage vertical (poulie)", en: "Lat pulldown", f: null },
      { fr: "Rowing buste penché", en: "Bent-over row", f: null },
    ],
    limited: [
      { fr: "Tractions / rowing haltères", en: "Pull-ups / dumbbell rows", f: null },
      { fr: "Rowing haltère unilatéral", en: "Single-arm dumbbell row", f: null },
      { fr: "Tirage élastique", en: "Band pulldown", f: null },
    ],
    home: [
      { fr: "Tractions (barre/élastique)", en: "Pull-ups (bar/band)", f: null },
      { fr: "Rowing élastique", en: "Band rows", f: null },
      { fr: "Rowing australien (sous une table)", en: "Inverted rows (under a table)", f: null },
    ],
  },
  lunge: {
    gym: [
      { fr: "Fentes marchées (sandbag)", en: "Walking lunges (sandbag)", f: null },
      { fr: "Fentes arrière (haltères)", en: "Reverse lunges (dumbbells)", f: null },
      { fr: "Step-ups lestés", en: "Loaded step-ups", f: null },
      { fr: "Fentes bulgares", en: "Bulgarian split squats", f: null },
    ],
    limited: [
      { fr: "Fentes marchées (sandbag/haltères)", en: "Walking lunges (sandbag/dumbbells)", f: null },
      { fr: "Step-ups lestés", en: "Loaded step-ups", f: null },
      { fr: "Fentes arrière lestées", en: "Loaded reverse lunges", f: null },
    ],
    home: [
      { fr: "Fentes marchées (sac à dos)", en: "Walking lunges (backpack)", f: null },
      { fr: "Fentes sautées", en: "Jumping lunges", f: null },
      { fr: "Step-ups (marche/banc)", en: "Step-ups (stairs/bench)", f: null },
    ],
  },
};
/* choisit une variante selon la semaine (rotation) ; repli sur equipAlt si non listé */
function pickLift(mvt, equip, lang, wk) {
  const pool = LIFT_VARIANTS[mvt] && LIFT_VARIANTS[mvt][equip];
  if (!pool || !pool.length) return { name: equipAlt(mvt, equip, lang), f: 1 };
  const v = pool[wk % pool.length];
  return { name: loc(lang, v.fr, v.en), f: v.f === undefined ? 1 : v.f };
}

/* ---------- Analyse des facteurs limitants ----------
   Méthode : on compare chaque atelier à la médiane de la division (ratio),
   puis on repère les ateliers où l'athlète est le plus en retard PAR RAPPORT
   À SON PROPRE NIVEAU MOYEN. C'est ça, un vrai facteur limitant. */
function analyzeLimiters(form) {
  // On compare aux médianes de la division où les temps ont été réalisés (course solo passée)
  const gender = (DIVISIONS[form.division] || {}).gender === "F" ? "femme" : "homme";
  const refKey = form.pastFormat ? `${gender}_${form.pastFormat}` : form.division;
  const ref = REF[refKey] || REF[form.division] || REF.homme_open;
  const times = form.stationTimes || {};
  const entries = STATIONS.map((s) => {
    const sec = mmssToSec(times[s.key]);
    return sec ? { key: s.key, name: s.name, sec, ratio: sec / ref[s.key] } : null;
  }).filter(Boolean);

  const runSec = mmssToSec(form.hyroxRunAvg);
  const runRatio = runSec ? runSec / ref.run : null;

  if (entries.length < 2) {
    return { hasData: false, limiters: form.weakStations || [], balance: null, detail: [] };
  }
  // niveau moyen de l'athlète vs sa division (1 = pile la médiane)
  const mean = entries.reduce((a, e) => a + e.ratio, 0) / entries.length;
  const scored = entries.map((e) => ({
    ...e,
    rel: e.ratio - mean,                       // écart à son propre niveau moyen
    over: Math.round((e.ratio - 1) * 100),     // écart à la médiane de la division (%)
  }));
  const sorted = [...scored].sort((a, b) => b.rel - a.rel);
  // facteurs limitants = nettement au-dessus de son niveau moyen (≥ 3 %)
  const limiters = sorted.filter((e) => e.rel > 0.03).slice(0, 3).map((e) => e.key);

  let balance = null;
  if (runRatio) {
    if (runRatio - mean > 0.05) balance = "run";
    else if (mean - runRatio > 0.05) balance = "stations";
    else balance = "equilibre";
  }
  return {
    hasData: true,
    limiters: limiters.length ? limiters : [sorted[0].key],
    balance, mean, runRatio,
    runOver: runRatio ? Math.round((runRatio - 1) * 100) : null,
    detail: sorted,
  };
}

/* ---------- Profil / niveau de course ---------- */
const RUN_LEVELS = ["Débutant", "Intermédiaire", "Confirmé", "Avancé", "Élite"];
function runProfile(form) {
  const fiveK = mmssToSec(form.fiveKTime) || RUN_LEVEL_5K[form.runLevel] || RUN_LEVEL_5K.intermediaire;
  const estimated = mmssToSec(form.fiveKTime) === null;
  const speed5k = 5000 / fiveK * 3.6;             // km/h sur 5 km
  const vma = Math.round(speed5k / 0.92 * 10) / 10; // estimation VMA
  let idx; // 0..4
  if (fiveK < 1050) idx = 4; else if (fiveK < 1200) idx = 3; else if (fiveK < 1410) idx = 2; else if (fiveK < 1680) idx = 1; else idx = 0;
  const ref = REF[form.division] || REF.homme_open;
  const hyroxPace = mmssToSec(form.hyroxRunAvg) || (fiveK / 5 + 38);
  const vsMedian = Math.round((hyroxPace / ref.run - 1) * 100); // négatif = plus rapide que la médiane
  return { fiveK, estimated, vma, idx, level: RUN_LEVELS[idx], speed5k: Math.round(speed5k * 10) / 10, hyroxPace, vsMedian };
}

/* ---------- Suivi adaptatif ---------- */
const INTENSITY_LABELS = { "-2": "Très allégé", "-1": "Allégé", "0": "Standard", "1": "Soutenu", "2": "Très soutenu" };
function suggestAdj(feedback, currentAdj) {
  const vals = Object.values(feedback || {});
  const easy = vals.filter((v) => v === "easy").length;
  const hard = vals.filter((v) => v === "hard").length;
  const ok = vals.filter((v) => v === "ok").length;
  const rated = easy + hard + ok;
  let target = currentAdj;
  if (easy - hard >= 3) target = Math.min(2, currentAdj + 1);
  else if (hard - easy >= 2) target = Math.max(-2, currentAdj - 1);
  return { easy, hard, ok, rated, target, changed: target !== currentAdj };
}

/* ---------- Générateurs de séances ---------- */
const ramp = (pp, lo, hi) => Math.round(lo + (hi - lo) * pp);
function sEasyRun(c) { const km = c.phaseKey === "base" ? ramp(c.pp, 5, 8) : c.phaseKey === "build" ? ramp(c.pp, 6, 9) : 6; const g = c.lang;
  return { cat: "run", title: loc(g, "Sortie souple", "Easy run"), tag: loc(g, "Endurance Z2", "Z2 endurance"), duration: km * 6 + 12, blocks: [
    { label: loc(g, "Échauffement", "Warm-up"), items: [loc(g, "5 min marche active + mobilité chevilles/hanches", "5 min brisk walk + ankle/hip mobility")] },
    { label: loc(g, "Bloc principal", "Main set"), items: [loc(g, `${km} km en aisance — allure ${fmtPace(c.z.easy)} (tu peux parler)`, `${km} km easy — pace ${fmtPace(c.z.easy)} (conversational)`)] },
    { label: loc(g, "Notes", "Notes"), items: [loc(g, "Volume facile. Si fatigue, ralentis sans culpabiliser.", "Easy volume. If tired, slow down guilt-free.")] }, ] }; }
function sLongRun(c) { const km = c.phaseKey === "base" ? ramp(c.pp, 8, 11) : c.phaseKey === "build" ? ramp(c.pp, 10, 14) : ramp(c.pp, 8, 12); const g = c.lang;
  const fin = c.phaseKey === "base" ? 0 : Math.max(2, Math.round(km * 0.25));
  return { cat: "run", title: loc(g, "Sortie longue", "Long run"), tag: loc(g, "Endurance fondamentale", "Aerobic base"), duration: km * 6 + 15, blocks: [
    { label: loc(g, "Échauffement", "Warm-up"), items: [loc(g, "10 min très facile + gammes", "10 min very easy + drills")] },
    { label: loc(g, "Bloc principal", "Main set"), items: [loc(g, `${km - fin} km à ${fmtPace(c.z.long)}`, `${km - fin} km at ${fmtPace(c.z.long)}`), fin ? loc(g, `Puis ${fin} km à allure course ${fmtPace(c.z.hyrox)}`, `Then ${fin} km at race pace ${fmtPace(c.z.hyrox)}`) : loc(g, "Allure régulière de bout en bout", "Steady pace throughout")].filter(Boolean) },
    { label: loc(g, "Notes", "Notes"), items: [loc(g, "Hydratation + ravito si > 75 min.", "Hydrate + fuel if > 75 min.")] }, ] }; }
function sIntervals(c) { const g = c.lang; const menus = { base: [["8 × 400 m", loc(g, "récup 90 s trot", "90 s jog recovery")], ["6 × 600 m", loc(g, "récup 90 s trot", "90 s jog recovery")]],
    build: [["6 × 800 m", loc(g, "récup 2 min trot", "2 min jog recovery")], ["5 × 1000 m", loc(g, "récup 2 min trot", "2 min jog recovery")], ["10 × 400 m", loc(g, "récup 75 s", "75 s recovery")]],
    specific: [["4 × 1000 m", loc(g, "récup 2 min", "2 min recovery")], ["5 × 800 m", loc(g, "récup 90 s", "90 s recovery")], ["3 × 1200 m", loc(g, "récup 2 min30", "2 min 30 recovery")]],
    taper: [["5 × 400 m " + loc(g, "vif", "fast"), loc(g, "récup 2 min, fraîcheur d'abord", "2 min recovery, freshness first")]] };
  const list = menus[c.phaseKey] || menus.build; const p = list[c.wk % list.length];
  return { cat: "run", title: loc(g, "Fractionné (VMA / seuil)", "Intervals (VO₂ / threshold)"), tag: loc(g, "Vitesse & VO₂", "Speed & VO₂"), duration: 55, blocks: [
    { label: loc(g, "Échauffement", "Warm-up"), items: [loc(g, "15 min progressif + 4 lignes droites + gammes", "15 min progressive + 4 strides + drills")] },
    { label: loc(g, "Bloc principal", "Main set"), items: [`${p[0]} ${loc(g, "à", "at")} ${fmtPace(c.z.interval)} — ${p[1]}`] },
    { label: loc(g, "Retour au calme", "Cool-down"), items: [loc(g, "10 min trot très facile", "10 min very easy jog")] }, ] }; }
function sTempo(c) {
  const pp = c.pp; const g = c.lang;
  // Phases finales : on remplace le seuil par de l'allure cible course (recommandé en prépa Hyrox)
  if (c.phaseKey === "specific" || c.phaseKey === "taper") {
    const opts = [["4 × 6 min"], ["3 × 8 min"], ["3 × 10 min"]];
    const pick = opts[Math.min(opts.length - 1, Math.round(pp * (opts.length - 1)))];
    return { cat: "run", title: loc(g, "Allure cible Hyrox", "Hyrox target pace"), tag: loc(g, "Spécifique course", "Race-specific"), duration: 60, blocks: [
      { label: loc(g, "Échauffement", "Warm-up"), items: [loc(g, "15 min facile + 4 lignes droites", "15 min easy + 4 strides")] },
      { label: loc(g, "Bloc principal", "Main set"), items: [`${pick[0]} ${loc(g, "à", "at")} ${fmtPace(c.z.hyrox)} — ${loc(g, "récup 2 min", "2 min recovery")}`] },
      { label: loc(g, "Notes", "Notes"), items: [loc(g, "Mémorise la sensation : en compétition, le GPS est souvent inutilisable dans les halls.", "Memorize the feel: in competition GPS is often useless inside the halls.")] },
      { label: loc(g, "Retour au calme", "Cool-down"), items: [loc(g, "10 min trot", "10 min jog")] }, ] };
  }
  // Base / Développement : tempo et seuil en alternance, progressifs
  const tempo = [["2 × 10 min"], ["3 × 10 min"], ["3 × 15 min"]];
  const seuil = [["4 × 4 min"], ["4 × 5 min"], ["4 × 6 min"]];
  const useSeuil = c.wk % 2 === 1;
  const set = useSeuil ? seuil : tempo;
  const pick = set[Math.min(set.length - 1, Math.round(pp * (set.length - 1)))];
  const pace = useSeuil ? c.z.threshold : c.z.tempo;
  const rec = useSeuil ? loc(g, "récup 2 min", "2 min recovery") : loc(g, "récup 3 min", "3 min recovery");
  const effort = useSeuil ? loc(g, "légèrement difficile", "comfortably hard") : loc(g, "confortablement dur", "controlled hard");
  return { cat: "run", title: useSeuil ? loc(g, "Seuil", "Threshold") : "Tempo", tag: loc(g, "Endurance de vitesse", "Speed endurance"), duration: 55, blocks: [
    { label: loc(g, "Échauffement", "Warm-up"), items: [loc(g, "15 min facile + 3 lignes droites", "15 min easy + 3 strides")] },
    { label: loc(g, "Bloc principal", "Main set"), items: [`${pick[0]} ${loc(g, "à", "at")} ${fmtPace(pace)} — ${rec} (${loc(g, "effort", "effort")} ${effort})`] },
    { label: loc(g, "Retour au calme", "Cool-down"), items: [loc(g, "10 min trot", "10 min jog")] }, ] }; }
/* Finisher métabolique AMRAP/EMOM (phases build/specific) — scalé sur les maxs */
function metconBlock(c) {
  const g = c.lang;
  const burp = c.maxBurp ? Math.max(5, Math.round(c.maxBurp * 0.5)) : 8;
  const pull = c.maxPull ? Math.max(3, Math.round(c.maxPull * 0.4)) : 6;
  if (c.wk % 2 === 0) {
    return { label: loc(g, "Finisher — EMOM 12 min", "Finisher — EMOM 12 min"), items: [
      loc(g, `Min 1 : ${burp} burpees`, `Min 1: ${burp} burpees`), `Min 2${loc(g, " : ", ": ")}12 ${equipAlt("wallball", c.equip, g)}`, loc(g, `Min 3 : ${pull} tractions`, `Min 3: ${pull} pull-ups`),
      loc(g, "4 tours. Le repos = le temps restant dans chaque minute.", "4 rounds. Rest = time left in each minute.") ] };
  }
  return { label: loc(g, "Finisher — AMRAP 10 min", "Finisher — AMRAP 10 min"), items: [
    loc(g, "Max de tours en 10 min :", "Max rounds in 10 min:"), `• 10 ${equipAlt("wallball", c.equip, g)}`, loc(g, "• 12 fentes lestées", "• 12 weighted lunges"),
    loc(g, `• ${pull} tractions`, `• ${pull} pull-ups`), loc(g, "• 200 m rameur", "• 200 m row") ] };
}
/* schéma de force par phase : lourd/peu de reps tôt → endurance/résistance tard */
function strengthScheme(phase, g) {
  if (phase === "base")     return { sets: 5, reps: 5,  rest: loc(g, "récup 2–3 min", "2–3 min rest"),            goal: loc(g, "force", "strength") };
  if (phase === "build")    return { sets: 4, reps: 4,  rest: loc(g, "récup 2–3 min", "2–3 min rest"),            goal: loc(g, "force max", "max strength") };
  if (phase === "specific") return { sets: 4, reps: 15, rest: loc(g, "récup 45–60 s (résistance)", "45–60 s rest (endurance)"), goal: loc(g, "endurance de force", "strength endurance") };
  return { sets: 3, reps: 6, rest: loc(g, "récup libre, charges légères", "free rest, light loads"), goal: loc(g, "entretien", "maintenance") };
}
function sStrengthLower(c) {
  const g = c.lang;
  const { sets, reps, rest, goal } = strengthScheme(c.phaseKey, g);
  const hingeReps = Math.min(reps, 8);
  const sqV = pickLift("squat", c.equip, g, c.wk);
  const dlV = pickLift("hinge", c.equip, g, c.wk);
  const luV = pickLift("lunge", c.equip, g, c.wk);
  const sq = loadFor(c.orm?.squat, reps, c.adj, sqV.f);
  const dl = loadFor(c.orm?.deadlift, hingeReps, c.adj, dlV.f);
  const items = [
    `${sqV.name} — ${sets} × ${reps}${sq ? ` → ${sq}` : ""}, ${rest}`,
    `${dlV.name} — ${sets} × ${hingeReps}${dl ? ` → ${dl}` : ""}`,
    `${equipAlt("sledpush", c.equip, g)} — ${loc(g, `5 × 15 m (≈ ${c.w.push}) si dispo`, `5 × 15 m (≈ ${c.w.push}) if available`)}`,
    `${luV.name} — ${loc(g, "3 × 20 m", "3 × 20 m")}`,
  ];
  const focus = ["sledpush", "sledpull", "lunge"].filter((k) => c.weak.includes(k)).map((k) => stationDrill(k, c.w, c.equip, g));
  const useMetcon = c.phaseKey === "build" || c.phaseKey === "specific";
  return { cat: "strength", title: loc(g, "Force — bas du corps", "Strength — lower body"), tag: `${loc(g, "Jambes", "Legs")} · ${goal}`, duration: 65, blocks: [
    { label: loc(g, "Échauffement", "Warm-up"), items: [loc(g, "8 min vélo/corde + mobilité hanches + activation fessiers", "8 min bike/rope + hip mobility + glute activation")] },
    { label: loc(g, "Bloc principal", "Main set"), items }, ...(focus.length ? [{ label: loc(g, "Facteur limitant ciblé", "Targeted limiting factor"), items: focus }] : []),
    useMetcon ? metconBlock(c) : { label: loc(g, "Gainage", "Core"), items: [loc(g, "3 × 45 s planche + 3 × 12 dead bug", "3 × 45 s plank + 3 × 12 dead bug")] }, ] }; }
function sStrengthUpper(c) {
  const g = c.lang;
  const { sets, reps, rest, goal } = strengthScheme(c.phaseKey, g);
  const prV = pickLift("press", c.equip, g, c.wk);
  const puV = pickLift("pull", c.equip, g, c.wk);
  const sh = loadFor(c.orm?.shoulder, reps, c.adj, prV.f);
  const bn = loadFor(c.orm?.bench, reps, c.adj);
  const pullSets = c.maxPull ? `${sets} × ${Math.max(3, Math.round(c.maxPull * (c.phaseKey === "specific" ? 0.55 : 0.45)))} ${loc(g, `(≈${c.phaseKey === "specific" ? 55 : 45} % de ton max)`, `(≈${c.phaseKey === "specific" ? 55 : 45}% of your max)`)}` : `${sets} × 6–10`;
  const items = [
    `${prV.name} — ${sets} × ${reps}${sh ? ` → ${sh}` : ""}, ${rest}`,
    ...(bn ? [`${loc(g, "Développé couché", "Bench press")} — ${sets} × ${reps} → ${bn}`] : []),
    `${puV.name} — ${pullSets}`,
    `${equipAlt("ski", c.equip, g)} — 4 × 250 m`,
    `${equipAlt("farmers", c.equip, g)} — 4 × 40 m (≈ ${c.w.farmers})`,
  ];
  const focus = ["ski", "sledpull", "farmers", "row"].filter((k) => c.weak.includes(k)).map((k) => stationDrill(k, c.w, c.equip, g));
  const useMetcon = c.phaseKey === "build" || c.phaseKey === "specific";
  return { cat: "strength", title: loc(g, "Force — haut du corps & grip", "Strength — upper body & grip"), tag: `${loc(g, "Tirage, épaules", "Pull, shoulders")} · ${goal}`, duration: 60, blocks: [
    { label: loc(g, "Échauffement", "Warm-up"), items: [loc(g, "8 min rameur léger + rotations épaules + élastique", "8 min easy row + shoulder rotations + band work")] },
    { label: loc(g, "Bloc principal", "Main set"), items }, ...(focus.length ? [{ label: loc(g, "Facteur limitant ciblé", "Targeted limiting factor"), items: focus }] : []),
    useMetcon ? metconBlock(c) : { label: loc(g, "Gainage", "Core"), items: [loc(g, "3 × 30 s gainage latéral / côté + suspension barre 3 × max", "3 × 30 s side plank / side + bar hang 3 × max")] }, ] }; }
function sCompromised(c) { const rounds = c.phaseKey === "build" ? 4 : 5; const g = c.lang;
  return { cat: "hyrox", title: loc(g, "Course compromise", "Compromised running"), tag: loc(g, "Courir sur jambes fatiguées", "Running on tired legs"), duration: 55, blocks: [
    { label: loc(g, "Échauffement", "Warm-up"), items: [loc(g, "12 min progressif + gammes", "12 min progressive + drills")] },
    { label: loc(g, "Bloc principal", "Main set"), items: [loc(g, `${rounds} tours à enchaîner :`, `${rounds} rounds back-to-back:`), `• 800 m ${loc(g, "à", "at")} ${fmtPace(c.z.hyrox)}`, `• 20 ${equipAlt("wallball", c.equip, g)} (${c.w.wallball})`, loc(g, "• 15 burpee broad jumps", "• 15 burpee broad jumps")] },
    { label: loc(g, "Notes", "Notes"), items: [loc(g, "Garder la même allure de course à chaque tour malgré la fatigue.", "Hold the same run pace every round despite fatigue.")] }, ] }; }
function sHyroxSim(c) { const n = c.phaseKey === "build" ? ramp(c.pp, 3, 5) : ramp(c.pp, 5, 8); const seq = STATIONS.slice(0, n); const g = c.lang;
  const recipe = { ski: `${equipAlt("ski", c.equip, g)} 1000 m`, sledpush: `${equipAlt("sledpush", c.equip, g)} 50 m (≈ ${c.w.push})`, sledpull: `${equipAlt("sledpull", c.equip, g)} 50 m (≈ ${c.w.pull})`, burpee: "Burpee broad jumps 80 m", row: `${equipAlt("row", c.equip, g)} 1000 m`, farmers: `${equipAlt("farmers", c.equip, g)} 200 m (${c.w.farmers})`, lunge: `${equipAlt("lunge", c.equip, g)} 100 m (${c.w.lunge})`, wallball: `Wall balls 100 ${loc(g, "reps", "reps")} (${c.w.wallball})` };
  const items = [loc(g, `Format : 1 km de course + 1 station, ${n} fois.`, `Format: 1 km run + 1 station, ${n} times.`), `${loc(g, "Allure course cible", "Target race pace")} : ${fmtPace(c.z.hyrox)}`];
  seq.forEach((s, i) => items.push(`Run ${i + 1} (1 km) → ${recipe[s.key]}`));
  return { cat: "hyrox", title: n >= 8 ? loc(g, "Simulation Hyrox complète", "Full Hyrox simulation") : loc(g, `Simulation Hyrox (${n} stations)`, `Hyrox simulation (${n} stations)`), tag: loc(g, "Spécifique course", "Race-specific"), duration: 30 + n * 12, blocks: [
    { label: loc(g, "Échauffement", "Warm-up"), items: [loc(g, "15 min progressif + mobilité + 2 stations légères", "15 min progressive + mobility + 2 light stations")] },
    { label: loc(g, "Le parcours", "The course"), items }, ...(c.weak.length ? [{ label: "Focus", items: [loc(g, `Reste calme sur tes facteurs limitants : ${c.weak.map((k) => STATIONS.find((s) => s.key === k)?.name).join(", ")}.`, `Stay calm on your limiting factors: ${c.weak.map((k) => STATIONS.find((s) => s.key === k)?.name).join(", ")}.`)] }] : []),
    { label: loc(g, "Notes", "Notes"), items: [loc(g, "Chronomètre chaque station + chaque km pour suivre tes progrès.", "Time each station + each km to track your progress.")] }, ] }; }
function sRecovery(c) { const g = c ? c.lang : "fr"; return { cat: "recovery", title: loc(g, "Récupération active", "Active recovery"), tag: loc(g, "Mobilité & régénération", "Mobility & recovery"), duration: 35, blocks: [
    { label: loc(g, "Au choix", "Your choice"), items: [loc(g, "25–30 min très facile : marche rapide, vélo ou nage", "25–30 min very easy: brisk walk, bike or swim")] },
    { label: loc(g, "Mobilité", "Mobility"), items: [loc(g, "10 min : hanches, chevilles, épaules, thoraciques", "10 min: hips, ankles, shoulders, thoracic spine")] },
    { label: loc(g, "Notes", "Notes"), items: [loc(g, "Aucune intensité. Le progrès se construit pendant la récupération.", "No intensity. Progress is built during recovery.")] }, ] }; }
function sRaceRehearsal(c) { const g = c.lang; const alt = `${equipAlt("wallball", c.equip, g)} / ${equipAlt("sledpush", c.equip, g)} / ${equipAlt("row", c.equip, g)}`; return { cat: "hyrox", title: loc(g, "Répétition jour J", "Race-day rehearsal"), tag: loc(g, "Affûtage — court & vif", "Taper — short & sharp"), duration: 45, blocks: [
    { label: loc(g, "Échauffement", "Warm-up"), items: [loc(g, "15 min comme le jour J : progressif + gammes + 2 lignes droites", "15 min like race day: progressive + drills + 2 strides")] },
    { label: loc(g, "Bloc principal", "Main set"), items: [loc(g, "Mini-simulation 3 tours :", "Mini-simulation, 3 rounds:"), `• 1 km ${loc(g, "à", "at")} ${fmtPace(c.z.hyrox)}`, loc(g, `• 1 station (alterne ${alt})`, `• 1 station (alternate ${alt})`)] },
    { label: loc(g, "Notes", "Notes"), items: [loc(g, "Reste large sous ta limite. On entretient, on ne construit plus.", "Stay well under your limit. We maintain, no longer build."), loc(g, "Teste tenue, chaussures, nutrition, transitions.", "Test kit, shoes, nutrition, transitions.")] }, ] }; }

function weeklyCategories(d, wk) { const r = wk % 2 === 0 ? "intervals" : "tempo";
  switch (d) {
    case 3: return [r, "strengthLower", wk % 2 === 0 ? "hyroxSim" : "longRun"];
    case 4: return ["intervals", "strengthLower", wk % 2 === 0 ? "longRun" : "compromised", wk % 2 === 0 ? "strengthUpper" : "hyroxSim"];
    case 5: return ["intervals", "strengthLower", "tempo", "strengthUpper", wk % 2 === 0 ? "hyroxSim" : "longRun"];
    case 6: return ["intervals", "strengthLower", "easyRun", "strengthUpper", "hyroxSim", "longRun"];
    default: return [r, "strengthLower", "hyroxSim"];
  } }
const GEN = { easyRun: sEasyRun, longRun: sLongRun, intervals: sIntervals, tempo: sTempo, strengthLower: sStrengthLower, strengthUpper: sStrengthUpper, compromised: sCompromised, hyroxSim: sHyroxSim, recovery: sRecovery, raceRehearsal: sRaceRehearsal };
const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
function weekLayout(d) { switch (d) {
    case 3: return [0, "rest", 1, "rest", 2, "rest", "rest"];
    case 4: return [0, "rest", 1, 2, "rest", 3, "rest"];
    case 5: return [0, 1, "rest", 2, 3, "rest", 4];
    case 6: return [0, 1, "rest", 2, 3, 4, "rest"];
    default: return [0, "rest", 1, "rest", 2, "rest", "rest"];
  } }

function generateProgram(form, limiters, adj = 0, lang = "fr") {
  const totalWeeks = form.weeks;
  const phaseSeq = buildPhases(totalWeeks);
  const fiveK = mmssToSec(form.fiveKTime) || RUN_LEVEL_5K[form.runLevel] || RUN_LEVEL_5K.intermediaire;
  const z = paceZones(fiveK, mmssToSec(form.hyroxRunAvg), adj);
  const w = DIVISIONS[form.division];
  const weak = Array.from(new Set([...(form.weakStations || []), ...(limiters.limiters || [])])).slice(0, 4);
  const equip = form.equipment;
  const counts = phaseSeq.reduce((a, k) => ((a[k] = (a[k] || 0) + 1), a), {});
  const seen = {};
  const weeks = phaseSeq.map((phaseKey, i) => {
    seen[phaseKey] = seen[phaseKey] || 0;
    const pp = counts[phaseKey] > 1 ? seen[phaseKey] / (counts[phaseKey] - 1) : 1; seen[phaseKey]++;
    const isRaceWeek = i === totalWeeks - 1;
    const isDeload = !isRaceWeek && phaseKey !== "taper" && (i + 1) % 4 === 0 && i < totalWeeks - 2;
    const cats = weeklyCategories(form.daysPerWeek, i);
    const ctx = { z, phaseKey, pp, wk: i, equip, w, weak, adj, lang, orm: form.oneRM || {}, maxPull: form.maxPullups, maxBurp: form.maxBurpees };
    let sessions = cats.map((c) => GEN[c]({ ...ctx }));
    if (phaseKey === "taper") {
      sessions = sessions.map((s) => s.cat === "strength" ? { ...s, duration: Math.round(s.duration * 0.6), tag: loc(lang, "Entretien léger", "Light maintenance"), blocks: s.blocks.slice(0, 2) } : s.cat === "hyrox" ? sRaceRehearsal(ctx) : GEN.easyRun(ctx));
      if (isRaceWeek) sessions = [GEN.easyRun(ctx), sRaceRehearsal(ctx), { cat: "recovery", title: loc(lang, "Veille de course", "Day before race"), tag: loc(lang, "Activation", "Activation"), duration: 20, blocks: [{ label: loc(lang, "Programme", "Plan"), items: [loc(lang, "15 min footing très léger + 3 lignes droites", "15 min very light jog + 3 strides"), loc(lang, "Mobilité douce", "Gentle mobility"), loc(lang, "Repos, hydratation, sommeil. Prépare ton sac.", "Rest, hydration, sleep. Pack your bag.")] }] }];
    }
    if (isDeload) sessions = sessions.map((s) => ({ ...s, duration: Math.round(s.duration * 0.65), tag: s.tag + loc(lang, " · allégé", " · easy") }));
    const layout = weekLayout(form.daysPerWeek).map((slot) => slot === "rest" ? null : sessions[slot] || null);
    const restIdxs = layout.map((s, idx) => s === null ? idx : -1).filter((x) => x >= 0);
    if (restIdxs.length && form.daysPerWeek <= 5) layout[restIdxs[Math.floor(restIdxs.length / 2)]] = sRecovery(ctx);
    const totalMin = layout.reduce((a, s) => a + (s ? s.duration : 0), 0);
    let focus = tr(lang, PHASE_META[phaseKey].desc);
    if (isDeload) focus = loc(lang, "Semaine de récupération : volume réduit pour absorber le travail.", "Recovery week: reduced volume to absorb the work.");
    if (isRaceWeek) focus = loc(lang, "Semaine de course ! Fraîcheur, routine, confiance. Tu es prêt·e.", "Race week! Freshness, routine, confidence. You're ready.");
    return { number: i + 1, phaseKey, phaseLabel: PHASE_META[phaseKey].label, color: PHASE_META[phaseKey].color, isDeload, isTaper: phaseKey === "taper", isRaceWeek, focus, totalMin, days: layout };
  });
  return { totalWeeks, daysPerWeek: form.daysPerWeek, division: w, z, phaseSeq, weeks, weak, eventCity: form.eventCity || "", raceDate: form.raceDate || "", adj };
}

/* ============================ UI ============================ */
const CAT_STYLE = {
  run: { c: "var(--cobalt)", Icon: Footprints, label: "Course" },
  strength: { c: "var(--ink)", Icon: Dumbbell, label: "Force" },
  hyrox: { c: "var(--orange)", Icon: Flame, label: "Hyrox" },
  recovery: { c: "var(--muted)", Icon: Wind, label: "Récup" },
};

function RhythmStrip({ height = 14 }) {
  return (<div className="rhythm" style={{ height }}>
    {Array.from({ length: 8 }).map((_, i) => (<React.Fragment key={i}><span className="rhythm-run" /><span className="rhythm-station" /></React.Fragment>))}
    <span className="rhythm-run rhythm-finish" />
  </div>);
}

/* ---------------- Barre de navigation ---------------- */
function Nav({ account, onLogin, onLogout, onHome, onStart, hasProgram, onProgram, lang, onToggleLang }) {
  const t = useT();
  return (<nav className="nav">
    <button className="brand" onClick={onHome} title={t("Retour à l'accueil")}>
      <span className="logo"><Activity size={17} /></span>
      <span className="brand-name">MyHyrox<span className="brand-accent">Prog</span></span>
    </button>
    <div className="nav-right">
      <button className="lang-toggle" onClick={onToggleLang} title="FR / EN" aria-label="Language">
        <span className={lang === "fr" ? "on" : ""}>FR</span><span className="sep">/</span><span className={lang === "en" ? "on" : ""}>EN</span>
      </button>
      {hasProgram && <button className="nav-link" onClick={onProgram}>{t("Mon programme")}</button>}
      {account ? (<>
        <span className="nav-user"><User size={14} /> {account.name}</span>
        <button className="btn ghost sm" onClick={onLogout}><LogOut size={14} /> {t("Déconnexion")}</button>
      </>) : (<>
        <button className="nav-link" onClick={onLogin}>{t("Se connecter")}</button>
        <button className="btn primary sm" onClick={onStart}>{t("Commencer")}</button>
      </>)}
    </div>
  </nav>);
}

/* ---------------- Landing ---------------- */
function Landing({ onStart }) {
  const t = useT();
  return (<div className="landing">
    <section className="hero">
      <div className="hero-copy">
        <span className="badge"><Sparkles size={13} /> {t("Programme généré sur-mesure")}</span>
        <h1 className="hero-title">{t("Ton plan Hyrox,")}<br /><span className="hl">{t("calé sur tes chiffres.")}</span></h1>
        <p className="hero-sub">{t("Renseigne tes allures, ta force et tes temps par atelier. On calcule tes facteurs limitants et on construit un programme semaine par semaine, jour par jour — de la fondation à l'affûtage.")}</p>
        <div className="hero-cta">
          <button className="btn primary lg" onClick={onStart}>{t("Générer mon programme")} <ArrowRight size={17} /></button>
          <span className="hero-note">{t("Première semaine offerte · sans carte")}</span>
        </div>
        <RhythmStrip height={16} />
        <div className="hero-legend mono">{t("8 km · 8 stations · 1 plan")}</div>
      </div>
      <div className="hero-app" aria-hidden="true">
        <div className="app-card">
          <div className="ac-head"><span className="ac-dot" /><span className="ac-dot" /><span className="ac-dot" /></div>
          <div className="ac-body">
            <div className="ac-row"><span className="ac-week mono">S01</span><span className="ac-chip" style={{ "--ch": "var(--cobalt)" }}>{t("Fondation")}</span><span className="ac-h mono">5,2 h</span></div>
            <div className="ac-day"><span className="ac-cat" style={{ background: "var(--cobalt)" }}><Footprints size={11} /></span><span className="ac-t">{t("Fractionné — 6 × 800 m")}</span><CheckCircle2 size={15} className="ac-done" /></div>
            <div className="ac-day"><span className="ac-cat" style={{ background: "var(--ink)" }}><Dumbbell size={11} /></span><span className="ac-t">{t("Force — bas du corps")}</span><CheckCircle2 size={15} className="ac-done" /></div>
            <div className="ac-day"><span className="ac-cat" style={{ background: "var(--orange)" }}><Flame size={11} /></span><span className="ac-t">{t("Simulation Hyrox")}</span><Circle size={15} className="ac-todo" /></div>
            <div className="ac-locked"><Lock size={13} /> {t("Semaines 2 → 12")}</div>
          </div>
        </div>
      </div>
    </section>

    <section className="features">
      {[
        { Icon: TrendingUp, t: "Facteurs limitants", d: "Tes temps par atelier révèlent ce qui te coûte le plus. Le plan attaque ces points en priorité." },
        { Icon: Gauge, t: "Allures calculées", d: "À partir de ton 5 km ou de ta course Hyrox, chaque séance reçoit son allure précise." },
        { Icon: Calendar, t: "Semaine par semaine", d: "Une vraie périodisation : fondation, développement, spécifique, affûtage jusqu'au jour J." },
        { Icon: CheckCircle2, t: "Suivi des séances", d: "Coche chaque séance réalisée et garde le fil de ta progression jusqu'à la course." },
      ].map((f, i) => (<div key={i} className="feat">
        <span className="feat-ic"><f.Icon size={18} /></span>
        <h3>{t(f.t)}</h3><p>{t(f.d)}</p>
      </div>))}
    </section>

    <section className="how">
      <span className="eyebrow">{t("Comment ça marche")}</span>
      <div className="how-steps">
        {[["Tes données", "Allures, force, matériel, temps Hyrox par atelier."], ["L'analyse", "On situe ton niveau et tes facteurs limitants."], ["Ton plan", "Un programme daté, ajusté chaque semaine jusqu'à la course."]].map(([ti, d], i) => (
          <div key={i} className="how-step"><span className="how-num mono">{pad(i + 1)}</span><div><h4>{t(ti)}</h4><p>{t(d)}</p></div></div>
        ))}
      </div>
      <button className="btn primary lg center-btn" onClick={onStart}>{t("Commencer maintenant")} <ArrowRight size={17} /></button>
    </section>
  </div>);
}

/* ---------------- Modale connexion (prototype local) ---------------- */
function AuthModal({ onClose, onConnect }) {
  const t = useT();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (<div className="modal-bg" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-x" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
      <h3 className="modal-title">{t("Connexion à ton espace")}</h3>
      <p className="modal-sub">{t("Ton programme et tes séances cochées sont gardés sur cet appareil.")}</p>
      <label className="field"><span className="field-label">{t("Prénom")}</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex" /></label>
      <label className="field"><span className="field-label">{t("E-mail")}</span>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@exemple.fr" /></label>
      <button className="btn primary full" disabled={!name.trim()} onClick={() => onConnect({ name: name.trim(), email: email.trim() })}>{t("Continuer")}</button>
      <p className="hint subtle">{t("Prototype : aucune donnée n'est envoyée sur internet. La connexion multi-appareils arrivera avec la version sécurisée.")}</p>
    </div>
  </div>);
}

/* ---------------- Paywall ---------------- */
function Paywall({ onClose, onUnlock }) {
  const t = useT();
  return (<div className="modal-bg" onClick={onClose}>
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-x" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
      <span className="badge"><Zap size={13} /> {t("Programme complet")}</span>
      <h3 className="modal-title">{t("Débloque tout ton plan")}</h3>
      <p className="modal-sub">{t("La semaine 1 est offerte. Débloque les semaines suivantes, le suivi complet et les ajustements jusqu'au jour J.")}</p>
      <div className="price"><span className="price-num mono">9,90 €</span><span className="price-per">{t("/ mois")}</span></div>
      <ul className="price-list">
        <li><Check size={15} /> {t("Toutes les semaines jusqu'à ta course")}</li>
        <li><Check size={15} /> {t("Suivi des séances et progression")}</li>
        <li><Check size={15} /> {t("Allures et facteurs limitants détaillés")}</li>
      </ul>
      <button className="btn primary full" onClick={onUnlock}>{t("Débloquer le programme")}</button>
      <p className="hint subtle">{t("Prototype : le déblocage est simulé sur cet appareil. Le paiement réel (Stripe) sera branché à l'étape suivante.")}</p>
    </div>
  </div>);
}

/* ---------------- Wizard ---------------- */
const STEPS = ["La course", "Course à pied", "Performances", "Force & matériel", "Disponibilité"];
function Wizard({ onGenerate, account }) {
  const [step, setStep] = useState(0);
  const [dateMode, setDateMode] = useState("event"); // "event" | "manual"
  const [eventCity, setEventCity] = useState("");
  const [raceDate, setRaceDate] = useState("");
  const [division, setDivision] = useState("homme_open");
  const [goal, setGoal] = useState("finir");
  const [knows5k, setKnows5k] = useState("yes");
  const [fiveKTime, setFiveKTime] = useState("");
  const [runLevel, setRunLevel] = useState("intermediaire");
  const [doneHyrox, setDoneHyrox] = useState("no");
  const [pastFormat, setPastFormat] = useState("open"); // open | pro (solo uniquement)
  const [hyroxFinish, setHyroxFinish] = useState("");
  const [hyroxRunAvg, setHyroxRunAvg] = useState("");
  const [stationTimes, setStationTimes] = useState({});
  const [strengthLevel, setStrengthLevel] = useState(3);
  const [experience, setExperience] = useState("intermediaire");
  const [equipment, setEquipment] = useState("gym");
  const [oneRM, setOneRM] = useState({ squat: "", deadlift: "", bench: "", shoulder: "" });
  const [maxPullups, setMaxPullups] = useState("");
  const [maxBurpees, setMaxBurpees] = useState("");
  const [weakStations, setWeak] = useState([]);
  const [daysPerWeek, setDays] = useState(4);

  const weeks = useMemo(() => raceDate ? Math.floor((new Date(raceDate) - new Date()) / (6048e5)) : null, [raceDate]);
  const toggleWeak = (k) => setWeak((p) => p.includes(k) ? p.filter((x) => x !== k) : p.length >= 4 ? p : [...p, k]);
  const setST = (k, v) => setStationTimes((p) => ({ ...p, [k]: v }));
  const setRM = (k, v) => setOneRM((p) => ({ ...p, [k]: v }));

  const canNext = () => {
    if (step === 0) return weeks !== null && weeks >= 1;
    if (step === 1) return knows5k === "no" || mmssToSec(fiveKTime) !== null;
    return true;
  };
  const t = useT();
  const submit = () => onGenerate({
    weeks: Math.min(24, Math.max(2, weeks)), division, goal, eventCity,
    fiveKTime: knows5k === "yes" ? fiveKTime : "", runLevel,
    doneHyrox, pastFormat, hyroxFinish, hyroxRunAvg, stationTimes,
    strengthLevel, experience, equipment, oneRM, maxPullups, maxBurpees, weakStations, daysPerWeek,
  });

  return (<div className="card wizard">
    <div className="wiz-steps">
      {STEPS.map((s, i) => (<div key={s} className={`wiz-step ${i === step ? "on" : i < step ? "done" : ""}`}>
        <span className="wiz-num">{i < step ? <Check size={12} /> : i + 1}</span><span className="wiz-label">{t(s)}</span></div>))}
    </div>
    <div className="wiz-body">
      {step === 0 && (<>
        <h3 className="q">{t("Quand a lieu ta course ?")}</h3>
        <div className="grid2">
          <button className={`chip ${dateMode === "event" ? "on" : ""}`} onClick={() => setDateMode("event")}>{t("Choisir une épreuve")}</button>
          <button className={`chip ${dateMode === "manual" ? "on" : ""}`} onClick={() => setDateMode("manual")}>{t("Saisir une date")}</button>
        </div>
        {dateMode === "event" ? (
          <label className="field mt"><span className="field-label"><MapPin size={14} /> {t("Épreuve HYROX")}</span>
            <select className="input" value={eventCity}
              onChange={(e) => { const ev = EVENTS.find((x) => x.city === e.target.value); setEventCity(e.target.value); if (ev) setRaceDate(ev.date); }}>
              <option value="">{t("— Sélectionne ton épreuve —")}</option>
              {EVENT_REGIONS.map((r) => (
                <optgroup key={r} label={r}>
                  {EVENTS.filter((ev) => ev.region === r && new Date(ev.date) > new Date())
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((ev) => (<option key={ev.city} value={ev.city}>{ev.city} ({ev.country}) — {fmtEventDate(ev.date)}</option>))}
                </optgroup>
              ))}
            </select>
            <span className="hint subtle">{t("Ton épreuve n'est pas listée (date pas encore publiée) ?")} <a href="https://hyrox.com/find-my-race/" target="_blank" rel="noreferrer" className="link">{t("Trouve-la sur le calendrier officiel")}</a> {t("puis saisis la date à la main.")}</span>
          </label>
        ) : (
          <label className="field mt"><span className="field-label"><Calendar size={14} /> {t("Date de l'épreuve")}</span>
            <input type="date" value={raceDate} onChange={(e) => { setRaceDate(e.target.value); setEventCity(""); }} className="input" /></label>
        )}
        {weeks !== null && (<p className={`hint ${weeks < 2 ? "warn" : ""}`}>
          {eventCity ? `${eventCity} · ` : ""}{weeks < 1 ? "Date passée ou trop proche — choisis une date future."
            : weeks < 4 ? `${weeks} semaine(s) : c'est court. Préparation finale ciblée.`
            : weeks > 24 ? `${weeks} semaines : plan plafonné à 24 semaines.`
            : `${weeks} semaines de préparation. Parfait pour progresser.`}</p>)}
        <h3 className="q mt">{t("Ta division")}</h3>
        <div className="grid2">{Object.entries(DIVISIONS).map(([k, v]) => (<button key={k} className={`chip ${division === k ? "on" : ""}`} onClick={() => setDivision(k)}>{t(v.label)}</button>))}</div>
        <h3 className="q mt">{t("Ton objectif")}</h3>
        <div className="grid3">{[["finir", "Terminer"], ["temps", "Temps cible"], ["perf", "Performance"]].map(([k, l]) => (<button key={k} className={`chip ${goal === k ? "on" : ""}`} onClick={() => setGoal(k)}>{t(l)}</button>))}</div>
      </>)}

      {step === 1 && (<>
        <h3 className="q">{t("Connais-tu ton temps sur 5 km ?")}</h3>
        <div className="grid2">
          <button className={`chip ${knows5k === "yes" ? "on" : ""}`} onClick={() => setKnows5k("yes")}>{t("Oui")}</button>
          <button className={`chip ${knows5k === "no" ? "on" : ""}`} onClick={() => setKnows5k("no")}>{t("Non, j'estime")}</button>
        </div>
        {knows5k === "yes" ? (<label className="field mt"><span className="field-label"><Timer size={14} /> {t("Temps sur 5 km (mm:ss)")}</span>
          <input className="input mono" placeholder="24:30" value={fiveKTime} onChange={(e) => setFiveKTime(e.target.value)} />
          {fiveKTime && mmssToSec(fiveKTime) === null && <span className="hint warn">{t("Format mm:ss, ex. 24:30")}</span>}</label>
        ) : (<div className="mt"><span className="field-label"><Gauge size={14} /> {t("Mon niveau en course")}</span>
          <div className="grid2">{[["debutant", "Débutant (~30 min)"], ["intermediaire", "Intermédiaire (~25 min)"], ["confirme", "Confirmé (~21 min)"], ["rapide", "Rapide (~18 min)"]].map(([k, l]) => (<button key={k} className={`chip ${runLevel === k ? "on" : ""}`} onClick={() => setRunLevel(k)}>{t(l)}</button>))}</div></div>)}
        <p className="hint subtle mt">{t("Sert à calculer toutes tes allures d'entraînement.")}</p>
      </>)}

      {step === 2 && (<>
        <h3 className="q">{t("As-tu déjà fait un Hyrox en solo ?")}</h3>
        <p className="hint subtle" style={{ marginTop: 0 }}>{t("Tes temps réels affinent le plan et révèlent tes facteurs limitants. Solo uniquement : les temps en duo ou relais ne sont pas comparables.")}</p>
        <div className="grid2">
          <button className={`chip ${doneHyrox === "yes" ? "on" : ""}`} onClick={() => setDoneHyrox("yes")}>{t("Oui, en solo")}</button>
          <button className={`chip ${doneHyrox === "no" ? "on" : ""}`} onClick={() => setDoneHyrox("no")}>{t("Pas encore")}</button>
        </div>
        {doneHyrox === "yes" && (<>
          <h3 className="q mt">{t("Format de ta course solo")}</h3>
          <div className="grid2">{[["open", "Solo Open"], ["pro", "Solo Pro"]].map(([k, l]) => (<button key={k} className={`chip ${pastFormat === k ? "on" : ""}`} onClick={() => setPastFormat(k)}>{t(l)}</button>))}</div>
          <p className="hint subtle">{t("Tes temps seront comparés aux médianes de cette division pour situer tes points faibles.")}</p>
          <div className="grid2 mt">
            <label className="field"><span className="field-label"><Timer size={14} /> {t("Temps final (mm:ss ou h:mm)")}</span>
              <input className="input mono" placeholder="1:25" value={hyroxFinish} onChange={(e) => setHyroxFinish(e.target.value)} /></label>
            <label className="field"><span className="field-label"><Footprints size={14} /> {t("Allure moyenne des runs (/km)")}</span>
              <input className="input mono" placeholder="5:45" value={hyroxRunAvg} onChange={(e) => setHyroxRunAvg(e.target.value)} /></label>
          </div>
          <h3 className="q mt">{t("Tes temps par atelier")} <span className="subtle">{t("(facultatif, mm:ss)")}</span></h3>
          <div className="st-times">
            {STATIONS.map((s) => (<label key={s.key} className="st-time">
              <span className="st-name">{s.name}</span>
              <input className="input mono sm" placeholder={secToMMSS(s.ref)} value={stationTimes[s.key] || ""} onChange={(e) => setST(s.key, e.target.value)} />
            </label>))}
          </div>
          <p className="hint subtle">{t("Renseigne au moins 2 ateliers pour activer la détection automatique des facteurs limitants.")}</p>
        </>)}
      </>)}

      {step === 3 && (<>
        <h3 className="q">{t("Ton niveau de force")}</h3>
        <div className="range-row"><input type="range" min="1" max="5" value={strengthLevel} onChange={(e) => setStrengthLevel(Number(e.target.value))} className="range" /><span className="mono range-val">{strengthLevel}/5</span></div>
        <h3 className="q mt">{t("Expérience fitness fonctionnel")}</h3>
        <div className="grid3">{[["debutant", "Débutant"], ["intermediaire", "Intermédiaire"], ["avance", "Avancé"]].map(([k, l]) => (<button key={k} className={`chip ${experience === k ? "on" : ""}`} onClick={() => setExperience(k)}>{t(l)}</button>))}</div>
        <h3 className="q mt">{t("Matériel disponible")}</h3>
        <div className="grid3">{[["gym", "Salle complète"], ["limited", "Matériel limité"], ["home", "Maison"]].map(([k, l]) => (<button key={k} className={`chip ${equipment === k ? "on" : ""}`} onClick={() => setEquipment(k)}>{t(l)}</button>))}</div>
        <h3 className="q mt">{t("Tes 1RM")} <span className="subtle">{t("(optionnel — pour des charges précises en kg)")}</span></h3>
        <div className="st-times">
          {[["squat", "Back Squat"], ["deadlift", "Soulevé de terre"], ["bench", "Développé couché"], ["shoulder", "Shoulder Press"]].map(([k, l]) => (
            <label key={k} className="st-time"><span className="st-name">{t(l)}</span>
              <input className="input mono sm" inputMode="numeric" placeholder="kg" value={oneRM[k]} onChange={(e) => setRM(k, e.target.value)} /></label>))}
        </div>
        <div className="st-times" style={{ marginTop: 9 }}>
          <label className="st-time"><span className="st-name">{t("Tractions max (reps)")}</span>
            <input className="input mono sm" inputMode="numeric" placeholder="ex. 12" value={maxPullups} onChange={(e) => setMaxPullups(e.target.value)} /></label>
          <label className="st-time"><span className="st-name">{t("Burpees en 1 min")}</span>
            <input className="input mono sm" inputMode="numeric" placeholder="ex. 20" value={maxBurpees} onChange={(e) => setMaxBurpees(e.target.value)} /></label>
        </div>
        <p className="hint subtle">{t("Si tu les renseignes, les séances de force afficheront les charges exactes (% de ton 1RM) et le volume de tractions sera calé sur ton max. Sinon, le programme reste en repères « lourd / 4×5 ».")}</p>
        <h3 className="q mt">{t("Tes points faibles ressentis")} <span className="subtle">{t("(jusqu'à 4)")}</span></h3>
        <div className="grid-st">{STATIONS.map((s) => (<button key={s.key} className={`chip sm ${weakStations.includes(s.key) ? "on" : ""}`} onClick={() => toggleWeak(s.key)}>{s.name}</button>))}</div>
      </>)}

      {step === 4 && (<>
        <h3 className="q">{t("Combien de jours par semaine ?")}</h3>
        <div className="grid4">{[3, 4, 5, 6].map((d) => (<button key={d} className={`chip big ${daysPerWeek === d ? "on" : ""}`} onClick={() => setDays(d)}><span className="mono big-num">{d}</span><span>{t("jours")}</span></button>))}</div>
        <div className="recap"><h4>{t("Récapitulatif")}</h4><ul>
          <li><MapPin size={13} /> {eventCity ? `${eventCity} · ` : ""}{weeks ? Math.min(24, Math.max(2, weeks)) : "—"} {t("semaines")} · {t(DIVISIONS[division].label)}</li>
          <li><Footprints size={13} /> 5 km : {knows5k === "yes" ? (fiveKTime || "—") : `niveau ${runLevel}`}{doneHyrox === "yes" && hyroxFinish ? ` · Hyrox : ${hyroxFinish}` : ""}</li>
          <li><Dumbbell size={13} /> {t("Force")} {strengthLevel}/5 · {equipment === "gym" ? t("salle") : equipment === "limited" ? t("limité") : t("maison")}</li>
          <li><Calendar size={13} /> {daysPerWeek} {t("séances")} / {t("semaine")}</li>
        </ul></div>
      </>)}
    </div>
    <div className="wiz-nav">
      <button className="btn ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>{t("Retour")}</button>
      {step < STEPS.length - 1 ? (<button className="btn primary" disabled={!canNext()} onClick={() => setStep((s) => s + 1)}>{t("Continuer")} <ArrowRight size={16} /></button>)
        : (<button className="btn primary" onClick={submit}>{t("Générer mon programme")} <Zap size={16} /></button>)}
    </div>
  </div>);
}

/* ---------------- Niveau de course ---------------- */
function RunLevelCard({ profile }) {
  const t = useT();
  if (!profile) return null;
  const faster = profile.vsMedian <= 0;
  return (<div className="card runlvl">
    <div className="rl-top">
      <div>
        <span className="eyebrow"><Footprints size={13} /> {t("Ton niveau de course")}</span>
        <div className="rl-level">{t(profile.level)}</div>
      </div>
      <div className="rl-stats">
        <div className="rl-stat"><span className="rl-l">{t("VMA estimée")}</span><span className="rl-v mono">{profile.vma} km/h</span></div>
        <div className="rl-stat"><span className="rl-l">{profile.estimated ? t("5 km estimé") : t("Allure 5 km")}</span><span className="rl-v mono">{secToMMSS(profile.fiveK / 5)} /km</span></div>
        <div className="rl-stat"><span className="rl-l">{t("vs médiane division")}</span><span className="rl-v mono" style={{ color: faster ? "var(--cobalt)" : "var(--orange)" }}>{profile.vsMedian > 0 ? `+${profile.vsMedian}%` : `${profile.vsMedian}%`}</span></div>
      </div>
    </div>
    <div className="rl-meter">{RUN_LEVELS.map((lv, i) => (
      <div key={lv} className={`rl-seg ${i <= profile.idx ? "on" : ""} ${i === profile.idx ? "cur" : ""}`}><span>{t(lv)}</span></div>
    ))}</div>
    <p className="hint subtle">{faster
      ? t("Ta course est un atout : sur Hyrox, courir plus vite que la médiane fait gagner de précieuses minutes (la course = ~51 % du temps total).")
      : t("La course est ton plus gros levier : ~51 % du temps total se joue sur les 8 km. Le plan met l'accent sur le volume facile et l'allure cible.")}
      {profile.estimated && (" " + t("Niveau estimé depuis ta catégorie déclarée — renseigne ton temps sur 5 km pour plus de précision."))}</p>
  </div>);
}

/* ---------------- Facteurs limitants ---------------- */
function LimitersCard({ limiters }) {
  const t = useT();
  if (!limiters.hasData) {
    return (<div className="card lim">
      <span className="eyebrow"><TrendingUp size={13} /> {t("Facteurs limitants")}</span>
      <p className="lim-empty">{t("Basés sur tes points faibles ressentis :")} <b>{limiters.limiters.length ? limiters.limiters.map((k) => STATIONS.find((s) => s.key === k)?.name).join(", ") : t("aucun précisé")}</b>. {t("Renseigne tes temps par atelier (étape Performances) pour une détection automatique précise.")}</p>
    </div>);
  }
  const bal = { run: t("Tu perds surtout du temps en course : priorité au volume et à la course fatiguée."), stations: t("Tu perds surtout sur les ateliers : priorité à la force et aux simulations."), equilibre: t("Course et ateliers sont équilibrés : on travaille les deux.") };
  const isLim = (k) => limiters.limiters.includes(k);
  return (<div className="card lim">
    <span className="eyebrow"><TrendingUp size={13} /> {t("Tes facteurs limitants")}</span>
    <p className="lim-lead">{t("Le programme attaque en priorité :")} <b>{limiters.limiters.map((k) => STATIONS.find((s) => s.key === k)?.name).join(", ")}</b>.</p>
    {limiters.balance && <p className="lim-bal">{bal[limiters.balance]}</p>}
    <div className="lim-bars">
      {limiters.detail.map((d) => (<div key={d.key} className={`lim-row ${isLim(d.key) ? "is-lim" : ""}`}>
        <span className="lim-st">{d.name}{isLim(d.key) && <span className="lim-tag">{t("point faible")}</span>}</span>
        <div className="lim-track"><div className="lim-mid" />
          <div className="lim-fill" style={{ width: `${Math.min(96, Math.max(6, 50 + d.over * 1.6))}%`, background: isLim(d.key) ? "var(--orange)" : d.over > 0 ? "var(--accent-deep)" : "var(--cobalt)" }} /></div>
        <span className="lim-val mono">{d.over > 0 ? `+${d.over}%` : `${d.over}%`}</span>
      </div>))}
    </div>
    <p className="hint subtle">{t("Écart par rapport à la médiane estimée de ta division (− = plus rapide, + = plus lent). Tes points faibles sont les ateliers où tu es le plus en retard par rapport à ton propre niveau moyen, pas dans l'absolu. Médianes indicatives issues d'analyses publiques de résultats HYROX — à affiner.")}</p>
  </div>);
}

/* ---------------- Séance ---------------- */
function SessionCard({ s, checked, fb, skipped, onToggle, onFeedback, onSkip, onPostpone }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  if (!s) return <div className="day rest"><span className="rest-label">{t("Repos")}</span></div>;
  const { c, Icon } = CAT_STYLE[s.cat];
  const fbOpts = [["easy", "Trop facile"], ["ok", "Parfait"], ["hard", "Trop dur"]];
  if (skipped) {
    return (<div className="day skipped">
      <div className="day-head">
        <span className="day-cat sk" style={{ background: c }}><Icon size={13} /></span>
        <span className="day-main"><span className="day-title">{s.title}</span><span className="day-tag">{t("Séance sautée")}</span></span>
        <button className="btn ghost sm" onClick={onSkip}><Undo2 size={14} /> {t("Annuler")}</button>
      </div>
    </div>);
  }
  return (<div className={`day ${open ? "open" : ""} ${checked ? "checked" : ""}`}>
    <div className="day-head">
      <button className="day-check" onClick={onToggle} aria-label={checked ? t("Décocher") : t("Marquer comme fait")}>
        {checked ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button>
      <button className="day-open" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="day-cat" style={{ background: c }}><Icon size={13} /></span>
        <span className="day-main"><span className="day-title">{s.title}</span><span className="day-tag">{s.tag}</span></span>
        <span className="day-dur mono">{s.duration}′</span>
        <ChevronDown size={16} className="day-chev" />
      </button>
      {!checked && (<div className="day-menu-wrap">
        <button className="day-menu-btn" onClick={() => setMenu((o) => !o)} aria-label={t("Options")}><MoreHorizontal size={17} /></button>
        {menu && (<div className="day-menu">
          <button onClick={() => { onPostpone(); setMenu(false); }}><Calendar size={13} /> {t("Reporter")}</button>
          <button onClick={() => { onSkip(); setMenu(false); }}><X size={13} /> {t("Sauter")}</button>
        </div>)}
      </div>)}
    </div>
    {checked && (<div className="day-fb">
      <span className="day-fb-l">{t("Ressenti :")}</span>
      {fbOpts.map(([v, l]) => (<button key={v} className={`fb-btn ${fb === v ? "on " + v : ""}`} onClick={() => onFeedback(fb === v ? null : v)}>{t(l)}</button>))}
    </div>)}
    {open && (<div className="day-body">{s.blocks.map((b, i) => (<div key={i} className="block">
      <span className="block-label">{b.label}</span><ul>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul></div>))}</div>)}
  </div>);
}

/* ---------------- Semaine ---------------- */
function WeekCard({ wk, locked, checks, feedback, skipped, onToggle, onFeedback, onSkip, onPostpone, onUnlock, defaultOpen }) {
  const t = useT();
  const [open, setOpen] = useState(defaultOpen);
  const dayCount = wk.days.filter(Boolean).length;
  const doneCount = wk.days.reduce((a, s, i) => a + (s && checks[`w${wk.number}d${i}`] ? 1 : 0), 0);
  return (<div className={`week ${open ? "open" : ""} ${wk.isRaceWeek ? "race" : ""} ${locked ? "locked" : ""}`}>
    <button className="week-head" onClick={() => locked ? onUnlock() : setOpen((o) => !o)} aria-expanded={open}>
      <span className="week-num mono">S{pad(wk.number)}</span>
      <span className="week-info">
        <span className="phase-chip" style={{ "--ch": wk.color }}>{t(wk.phaseLabel)}{wk.isDeload && (" · " + t("récup"))}{wk.isRaceWeek && " · 🏁"}</span>
        <span className="week-focus">{wk.focus}</span>
      </span>
      {locked ? <span className="week-lock"><Lock size={15} /></span>
        : <span className="week-meta mono">{doneCount}/{dayCount} · {Math.round(wk.totalMin / 60 * 10) / 10} h</span>}
      {!locked && <ChevronDown size={18} className="day-chev" />}
    </button>
    {!locked && open && (<div className="week-days">
      {wk.days.map((s, i) => (<div key={i} className="day-row">
        <span className="dow mono">{t(DAY_NAMES[i])}</span>
        <SessionCard s={s} checked={!!checks[`w${wk.number}d${i}`]} fb={feedback[`w${wk.number}d${i}`]} skipped={!!skipped[`w${wk.number}d${i}`]} onToggle={() => onToggle(`w${wk.number}d${i}`)} onFeedback={(v) => onFeedback(`w${wk.number}d${i}`, v)} onSkip={() => onSkip(`w${wk.number}d${i}`)} onPostpone={() => onPostpone(wk.number, i)} />
      </div>))}
    </div>)}
    {locked && (<div className="week-locked-body" onClick={onUnlock}>
      <Lock size={16} /> <span>{t("Débloque le programme complet pour voir cette semaine")}</span>
      <button className="btn primary sm">{t("Débloquer")}</button>
    </div>)}
  </div>);
}

/* ---------------- Dashboard ---------------- */
function Dashboard({ program, limiters, profile, unlocked, checks, feedback, skipped, onToggle, onFeedback, onSkip, onPostpone, onAdjust, onUnlock, onRestart }) {
  const { division, z, weeks, totalWeeks, daysPerWeek } = program;
  const [showWeights, setShowWeights] = useState(false);
  const phaseSummary = useMemo(() => { const out = []; let cur = null;
    program.phaseSeq.forEach((k, i) => { if (!cur || cur.k !== k) { cur = { k, start: i + 1, end: i + 1 }; out.push(cur); } else cur.end = i + 1; }); return out; }, [program.phaseSeq]);
  let totalSessions = 0, skippedCount = 0;
  weeks.forEach((w) => w.days.forEach((s, d) => { if (s) { totalSessions++; if (skipped[`w${w.number}d${d}`]) skippedCount++; } }));
  const effTotal = Math.max(0, totalSessions - skippedCount);
  const doneSessions = Object.values(checks).filter(Boolean).length;
  const pct = effTotal ? Math.round(doneSessions / effTotal * 100) : 0;
  const adj = program.adj || 0;
  const sg = suggestAdj(feedback, adj);
  const t = useT();

  return (<div className="program">
    <div className="summary card">
      <div className="sum-top">
        <div><span className="eyebrow">{t("Ton plan personnalisé")}</span><h2 className="sum-title">{program.eventCity ? t("Cap sur {city}", { city: program.eventCity }) : t("Route vers le départ")}</h2></div>
        <div className="countdown"><span className="mono cd-num">{totalWeeks}</span><span className="cd-label">{t("semaines")}<br />{t("avant la course")}</span></div>
      </div>
      <RhythmStrip height={16} />
      <div className="progress-wrap">
        <div className="progress-top"><span>{t("Progression")}</span><span className="mono">{doneSessions}/{effTotal} {t("séances")} · {pct}%</span></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="sum-grid">
        <div className="sum-cell"><span className="sc-l">{t("Division")}</span><span className="sc-v">{t(division.label)}</span></div>
        <div className="sum-cell"><span className="sc-l">{t("Intensité actuelle")}</span><span className="sc-v">{t(INTENSITY_LABELS[String(adj)])}</span></div>
        <div className="sum-cell"><span className="sc-l">{t("Séances / sem.")}</span><span className="sc-v mono">{daysPerWeek}</span></div>
        <div className="sum-cell"><span className="sc-l">{t("Allure souple")}</span><span className="sc-v mono">{fmtPace(z.easy)}</span></div>
        <div className="sum-cell"><span className="sc-l">{t("Allure tempo")}</span><span className="sc-v mono">{fmtPace(z.tempo)}</span></div>
        <div className="sum-cell"><span className="sc-l">{t("Allure fractionné")}</span><span className="sc-v mono">{fmtPace(z.interval)}</span></div>
        <div className="sum-cell"><span className="sc-l">{t("Allure course Hyrox")}</span><span className="sc-v mono">{fmtPace(z.hyrox)}</span></div>
      </div>
    </div>

    <RunLevelCard profile={profile} />
    <LimitersCard limiters={limiters} />

    <div className="timeline card">
      <span className="eyebrow">{t("Les 4 phases")}</span>
      <div className="tl-bar">{phaseSummary.map((p, i) => { const span = p.end - p.start + 1;
        return (<div key={i} className="tl-seg" style={{ flex: span, "--ch": PHASE_META[p.k].color }}>
          <span className="tl-name">{t(PHASE_META[p.k].label)}</span><span className="tl-weeks mono">S{p.start}{span > 1 ? `–${p.end}` : ""}</span></div>); })}</div>
      <div className="tl-legend">{phaseSummary.map((p, i) => (<div key={i} className="tl-leg-item"><span className="dot" style={{ background: PHASE_META[p.k].color }} />{t(PHASE_META[p.k].label)} — {t(PHASE_META[p.k].desc)}</div>))}</div>
    </div>

    <div className="weights card">
      <button className="weights-head" onClick={() => setShowWeights((s) => !s)} aria-expanded={showWeights}>
        <span><Anchor size={15} /> {t("Poids de référence")} · {t(division.label)}</span><ChevronDown size={16} className={`day-chev ${showWeights ? "rot" : ""}`} /></button>
      {showWeights && (<><div className="weights-grid">
        <div className="wg"><span>Sled Push</span><b className="mono">{division.push}</b></div>
        <div className="wg"><span>Sled Pull</span><b className="mono">{division.pull}</b></div>
        <div className="wg"><span>Farmers Carry</span><b className="mono">{division.farmers}</b></div>
        <div className="wg"><span>Sandbag Lunges</span><b className="mono">{division.lunge}</b></div>
        <div className="wg"><span>Wall Balls</span><b className="mono">{division.wallball}</b></div>
        <div className="wg"><span>SkiErg / {t("Rameur")}</span><b className="mono">1000 m</b></div>
      </div><p className="hint subtle">{t("Valeurs indicatives saison 2025/26 (poids du traîneau inclus). Vérifie toujours les standards officiels de ta course sur le site HYROX.")}</p></>)}
    </div>

    {sg.rated >= 3 && (<div className={`adapt-band ${sg.changed ? "go" : ""}`}>
      <TrendingUp size={16} />
      <span>{sg.changed
        ? (sg.target > adj
          ? t("Tes retours montrent que c'est trop facile ({n} séances faciles). On peut monter l'intensité d'un cran.", { n: sg.easy })
          : t("Tes retours montrent que c'est trop dur ({n} séances dures). On peut alléger d'un cran.", { n: sg.hard }))
        : t("Retours pris en compte : intensité « {lvl} » bien calée pour l'instant.", { lvl: t(INTENSITY_LABELS[String(adj)]) })}</span>
      {sg.changed && <button className="btn primary sm" onClick={() => onAdjust(sg.target)}>{t("Réajuster mon plan")}</button>}
    </div>)}

    {!unlocked && (<div className="paywall-band" onClick={onUnlock}>
      <Lock size={15} /> <span>{t("Semaine 1 offerte. Débloque les {n} semaines suivantes + le suivi complet.", { n: totalWeeks - 1 })}</span>
      <button className="btn primary sm">{t("Débloquer")}</button>
    </div>)}

    <div className="weeks">{weeks.map((wk) => (<WeekCard key={wk.number} wk={wk} locked={!unlocked && wk.number > 1} checks={checks} feedback={feedback} skipped={skipped} onToggle={onToggle} onFeedback={onFeedback} onSkip={onSkip} onPostpone={onPostpone} onUnlock={onUnlock} defaultOpen={wk.number === 1} />))}</div>

    <div className="prog-actions">
      <button className="btn primary" onClick={() => downloadICS(program)}><Calendar size={15} /> {t("Ajouter à mon agenda (.ics)")}</button>
      <button className="btn ghost" onClick={() => window.print()}><Printer size={15} /> {t("Imprimer / PDF")}</button>
      <button className="btn ghost" onClick={onRestart}><RotateCcw size={15} /> {t("Nouveau programme")}</button>
    </div>
    <p className="hint subtle center">{t("Fichier .ics : sur iPhone/Mac il s'ouvre dans Apple Calendrier ; pour Google Agenda, importe le fichier (Paramètres → Importer). Les séances apparaissent aux bonnes dates jusqu'à ta course.")}</p>
    <p className="hint subtle center">{t("Programme sauvegardé sur cet appareil. Plan d'entraînement général, pas un avis médical : en cas de doute, consulte un professionnel.")}</p>
  </div>);
}

/* ---------------- Export agenda (.ics — Apple Calendar & Google Agenda) ---------------- */
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const mondayOf = (d) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; return addDays(x, -day); };
const icsDate = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const icsEsc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
function buildICS(program, lang) {
  const anchor = program.raceDate ? new Date(program.raceDate + "T00:00:00") : new Date();
  const raceMon = mondayOf(anchor);
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MyHyroxProg//FR-EN//", "CALSCALE:GREGORIAN"];
  program.weeks.forEach((wk) => {
    const mon = addDays(raceMon, -(program.totalWeeks - wk.number) * 7);
    wk.days.forEach((s, d) => {
      if (!s) return;
      const date = addDays(mon, d);
      const desc = s.blocks.map((b) => `${b.label}: ${b.items.join(" / ")}`).join("\n");
      lines.push("BEGIN:VEVENT", `UID:mhp-w${wk.number}d${d}@myhyroxprog`,
        `DTSTART;VALUE=DATE:${icsDate(date)}`, `DTEND;VALUE=DATE:${icsDate(addDays(date, 1))}`,
        `SUMMARY:${icsEsc(`MyHyroxProg — ${s.title} (${s.duration}′)`)}`,
        `DESCRIPTION:${icsEsc(desc)}`, "END:VEVENT");
    });
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
function downloadICS(program, lang) {
  try {
    const blob = new Blob([buildICS(program, lang)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "myhyroxprog.ics";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) { /* no-op */ }
}

/* ---------------- App ---------------- */
export default function App() {
  const [account, setAccount] = useState(() => store.get("mhp_account", null));
  const [saved, setSaved] = useState(() => store.get("mhp_data", null)); // {form, program, limiters}
  const [checks, setChecks] = useState(() => store.get("mhp_checks", {}));
  const [feedback, setFeedback] = useState(() => store.get("mhp_feedback", {}));
  const [skipped, setSkipped] = useState(() => store.get("mhp_skipped", {}));
  const [unlocked, setUnlocked] = useState(() => store.get("mhp_unlocked", false));
  const [view, setView] = useState(() => store.get("mhp_data", null) ? "dashboard" : "landing");
  const [showAuth, setShowAuth] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [lang, setLang] = useState(() => store.get("mhp_lang", "fr"));
  const topRef = useRef(null);

  useEffect(() => { store.set("mhp_lang", lang); }, [lang]);
  useEffect(() => {
    setSaved((prev) => {
      if (!prev || !prev.form) return prev;
      const program = generateProgram(prev.form, prev.limiters, prev.program?.adj || 0, lang);
      const data = { ...prev, program };
      store.set("mhp_data", data);
      return data;
    });
  }, [lang]);
  useEffect(() => { const id = "mhp-fonts"; if (!document.getElementById(id)) {
    const l = document.createElement("link"); l.id = id; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap";
    document.head.appendChild(l); } }, []);

  useEffect(() => { store.set("mhp_checks", checks); }, [checks]);
  useEffect(() => { store.set("mhp_feedback", feedback); }, [feedback]);
  useEffect(() => { store.set("mhp_skipped", skipped); }, [skipped]);
  useEffect(() => { store.set("mhp_unlocked", unlocked); }, [unlocked]);

  const handleGenerate = (form) => {
    const limiters = analyzeLimiters(form);
    const program = generateProgram(form, limiters, 0, lang);
    const profile = runProfile(form);
    const data = { form, program, limiters, profile };
    setSaved(data); store.set("mhp_data", data);
    setView("dashboard"); setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };
  const restart = () => { store.del("mhp_data"); setSaved(null); setChecks({}); store.set("mhp_checks", {}); setFeedback({}); store.set("mhp_feedback", {}); setSkipped({}); store.set("mhp_skipped", {}); setView("onboarding"); };
  const connect = (acc) => { setAccount(acc); store.set("mhp_account", acc); setShowAuth(false); };
  const logout = () => { setAccount(null); store.del("mhp_account"); };
  const toggleCheck = (key) => setChecks((p) => ({ ...p, [key]: !p[key] }));
  const toggleSkip = (key) => setSkipped((p) => { const n = { ...p }; if (n[key]) delete n[key]; else n[key] = true; return n; });
  const postponeSession = (weekNum, dayIdx) => {
    setSaved((prev) => {
      if (!prev || !prev.program) return prev;
      const program = JSON.parse(JSON.stringify(prev.program));
      const weeks = program.weeks;
      const wi = weeks.findIndex((w) => w.number === weekNum);
      if (wi < 0) return prev;
      const sess = weeks[wi].days[dayIdx];
      if (!sess) return prev;
      let placed = false;
      for (let d = dayIdx + 1; d < 7 && !placed; d++) {
        if (!weeks[wi].days[d]) { weeks[wi].days[d] = sess; weeks[wi].days[dayIdx] = null; placed = true; }
      }
      for (let w = wi + 1; w < weeks.length && !placed; w++) {
        for (let d = 0; d < 7 && !placed; d++) {
          if (!weeks[w].days[d]) { weeks[w].days[d] = sess; weeks[wi].days[dayIdx] = null; placed = true; }
        }
      }
      if (!placed) return prev;
      weeks.forEach((w) => { w.totalMin = w.days.reduce((a, s) => a + (s ? s.duration : 0), 0); });
      const data = { ...prev, program };
      store.set("mhp_data", data);
      return data;
    });
  };
  const setSessionFeedback = (key, val) => setFeedback((p) => { const n = { ...p }; if (val === null) delete n[key]; else n[key] = val; return n; });
  const applyAdjustment = (target) => {
    if (!saved?.form) return;
    const program = generateProgram(saved.form, saved.limiters, target, lang);
    const data = { ...saved, program };
    setSaved(data); store.set("mhp_data", data);
    setFeedback({}); store.set("mhp_feedback", {}); // on repart sur des retours frais
  };
  const unlock = () => { setUnlocked(true); setShowPay(false); };

  const goHome = () => { setView("landing"); setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth" }), 30); };
  const goProgram = () => setView("dashboard");
  const goStart = () => setView("onboarding");

  const t = (s, vars) => tr(lang, s, vars);
  return (<LangContext.Provider value={lang}><div className="mhp">
    <style>{CSS}</style>
    <Nav account={account} onLogin={() => setShowAuth(true)} onLogout={logout} onHome={goHome} onStart={goStart} hasProgram={!!saved} onProgram={goProgram} lang={lang} onToggleLang={() => setLang((l) => l === "fr" ? "en" : "fr")} />
    <div ref={topRef} />
    <main className="main">
      {view === "landing" && <Landing onStart={goStart} />}
      {view === "onboarding" && (<div className="onboarding"><h2 className="ob-title">{t("Construisons ton programme")}</h2><Wizard onGenerate={handleGenerate} account={account} /></div>)}
      {view === "dashboard" && saved && (<Dashboard program={saved.program} limiters={saved.limiters} profile={saved.profile || (saved.form ? runProfile(saved.form) : null)} unlocked={unlocked} checks={checks} feedback={feedback} skipped={skipped} onToggle={toggleCheck} onFeedback={setSessionFeedback} onSkip={toggleSkip} onPostpone={postponeSession} onAdjust={applyAdjustment} onUnlock={() => setShowPay(true)} onRestart={restart} />)}
    </main>
    <footer className="foot"><RhythmStrip height={10} /><span>{t("MyHyroxProg — générateur d'entraînement · allures et charges sont des repères à ajuster à tes sensations.")}</span></footer>
    {showAuth && <AuthModal onClose={() => setShowAuth(false)} onConnect={connect} />}
    {showPay && <Paywall onClose={() => setShowPay(false)} onUnlock={unlock} />}
  </div></LangContext.Provider>);
}

/* ============================ CSS ============================ */
const CSS = `
.mhp{
  --ink:#16181D; --ink-2:#23262F; --paper:#ECE9E0; --paper-2:#E2DED2;
  --card:#FBFAF6; --line:rgba(22,24,29,.12); --line-2:rgba(22,24,29,.07);
  --muted:#6B6F79; --cobalt:#2B4BEE; --orange:#F0531E;
  --accent:#E6FB47; --accent-deep:#B9C400; --accent-ink:#1A1C12;
  font-family:'Inter',system-ui,sans-serif; color:var(--ink); background:var(--paper);
  min-height:100%; -webkit-font-smoothing:antialiased;
}
.mhp *{box-sizing:border-box;}
.mhp .mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-feature-settings:"tnum";}
.mhp button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;}

/* Nav */
.nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;
  padding:13px 22px;background:rgba(236,233,224,.85);backdrop-filter:blur(10px);border-bottom:1px solid var(--line-2);}
.brand{display:flex;align-items:center;gap:9px;}
.logo{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:var(--ink);color:var(--accent);}
.brand-name{font-family:'Archivo';font-weight:800;letter-spacing:-.02em;font-size:18px;}
.brand-accent{color:var(--cobalt);}
.nav-right{display:flex;align-items:center;gap:12px;}
.nav-link{font-size:14px;font-weight:600;color:var(--ink-2);}
.nav-link:hover{color:var(--cobalt);}
.lang-toggle{display:inline-flex;align-items:center;gap:3px;font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:700;border:1.5px solid var(--line);border-radius:99px;padding:4px 9px;color:var(--muted);}
.lang-toggle:hover{border-color:var(--ink);}
.lang-toggle .on{color:var(--cobalt);}
.lang-toggle .sep{color:var(--line);font-weight:400;}
.nav-user{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--ink-2);}

/* Buttons */
.btn{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:11px;font-weight:700;font-size:14px;transition:.12s;white-space:nowrap;}
.btn.sm{padding:8px 13px;font-size:13px;border-radius:9px;}
.btn.lg{padding:14px 24px;font-size:15.5px;border-radius:13px;}
.btn.full{width:100%;justify-content:center;margin-top:4px;}
.btn.primary{background:var(--accent);color:var(--accent-ink);}
.btn.primary:hover{filter:brightness(1.04);transform:translateY(-1px);}
.btn.primary:disabled{background:var(--paper-2);color:var(--muted);cursor:not-allowed;transform:none;}
.btn.ghost{background:var(--card);border:1.5px solid var(--line);color:var(--ink);}
.btn.ghost:hover{border-color:var(--ink);}
.btn.ghost:disabled{opacity:.4;cursor:not-allowed;}

/* Layout */
.main{max-width:1000px;margin:0 auto;padding:0 20px 60px;}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;box-shadow:0 1px 0 rgba(0,0,0,.02),0 18px 40px -30px rgba(22,24,29,.4);}

/* Hero */
.landing{padding-top:18px;}
.hero{display:grid;grid-template-columns:1fr;gap:34px;padding:38px 0 30px;align-items:center;}
@media(min-width:860px){.hero{grid-template-columns:1.05fr .95fr;gap:48px;padding:56px 0 40px;}}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:700;color:var(--cobalt);
  background:rgba(43,75,238,.09);padding:5px 11px;border-radius:99px;margin-bottom:18px;}
.hero-title{font-family:'Archivo';font-weight:900;line-height:.97;letter-spacing:-.03em;font-size:clamp(36px,6.5vw,62px);margin:0 0 16px;}
.hero-title .hl{color:var(--cobalt);}
.hero-sub{max-width:520px;color:var(--ink-2);font-size:16.5px;line-height:1.55;margin:0 0 24px;}
.hero-cta{display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:26px;}
.hero-note{font-size:13px;color:var(--muted);}
.hero-legend{margin-top:11px;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);}
.rhythm{display:flex;align-items:center;gap:3px;width:100%;color:var(--ink);}
.rhythm-run{flex:2;height:3px;border-radius:2px;background:currentColor;opacity:.3;}
.rhythm-station{flex:1;height:100%;border-radius:3px;background:var(--cobalt);}
.rhythm-finish{flex:1.4;background:var(--accent-deep);height:4px;}

/* Hero app mock */
.hero-app{display:flex;justify-content:center;}
.app-card{width:100%;max-width:380px;background:var(--ink);border-radius:20px;padding:16px;box-shadow:0 30px 60px -30px rgba(22,24,29,.6);}
.ac-head{display:flex;gap:6px;margin-bottom:14px;}
.ac-dot{width:9px;height:9px;border-radius:50%;background:#3A3E48;}
.ac-body{background:var(--card);border-radius:13px;padding:14px;display:flex;flex-direction:column;gap:9px;}
.ac-row{display:flex;align-items:center;gap:9px;}
.ac-week{font-size:14px;font-weight:700;color:var(--ink);}
.ac-chip{--ch:var(--cobalt);font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#fff;background:var(--ch);padding:2px 8px;border-radius:99px;}
.ac-h{margin-left:auto;font-size:12px;color:var(--muted);}
.ac-day{display:flex;align-items:center;gap:9px;padding:9px 10px;border:1px solid var(--line-2);border-radius:10px;}
.ac-cat{display:grid;place-items:center;width:22px;height:22px;border-radius:6px;color:#fff;flex-shrink:0;}
.ac-t{font-size:12.5px;font-weight:600;flex:1;}
.ac-done{color:var(--cobalt);}
.ac-todo{color:var(--line);}
.ac-locked{display:flex;align-items:center;justify-content:center;gap:7px;font-size:12px;font-weight:600;color:var(--muted);
  background:var(--paper-2);border-radius:10px;padding:11px;border:1px dashed var(--line);}

/* Features */
.features{display:grid;grid-template-columns:1fr;gap:14px;padding:24px 0;}
@media(min-width:640px){.features{grid-template-columns:repeat(2,1fr);}}
@media(min-width:980px){.features{grid-template-columns:repeat(4,1fr);}}
.feat{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;}
.feat-ic{display:grid;place-items:center;width:38px;height:38px;border-radius:10px;background:var(--paper-2);color:var(--cobalt);margin-bottom:13px;}
.feat h3{font-family:'Archivo';font-weight:800;font-size:16px;margin:0 0 6px;letter-spacing:-.01em;}
.feat p{font-size:13.5px;line-height:1.5;color:var(--ink-2);margin:0;}

/* How */
.how{padding:30px 0 10px;}
.eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:11px;text-transform:uppercase;letter-spacing:.16em;color:var(--muted);font-weight:700;}
.how-steps{display:grid;grid-template-columns:1fr;gap:14px;margin:18px 0 26px;}
@media(min-width:760px){.how-steps{grid-template-columns:repeat(3,1fr);}}
.how-step{display:flex;gap:14px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:20px;}
.how-num{font-family:'JetBrains Mono';font-weight:700;font-size:20px;color:var(--accent-deep);}
.how-step h4{font-family:'Archivo';font-weight:800;font-size:16px;margin:0 0 5px;}
.how-step p{font-size:13.5px;color:var(--ink-2);margin:0;line-height:1.5;}
.center-btn{display:flex;margin:0 auto;}

/* Onboarding */
.onboarding{padding:28px 0;}
.ob-title{font-family:'Archivo';font-weight:900;letter-spacing:-.02em;font-size:clamp(24px,5vw,34px);margin:0 0 18px;}

/* Wizard */
.wizard{padding:0;overflow:hidden;max-width:680px;}
.wiz-steps{display:flex;gap:4px;padding:15px 16px;border-bottom:1px solid var(--line-2);background:linear-gradient(var(--paper-2),transparent);flex-wrap:wrap;}
.wiz-step{display:flex;align-items:center;gap:7px;font-size:12px;color:var(--muted);font-weight:500;padding:5px 9px;border-radius:99px;}
.wiz-step.on{color:var(--ink);background:#fff;border:1px solid var(--line);}
.wiz-step.done{color:var(--ink);}
.wiz-num{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:var(--paper-2);font-size:10.5px;font-weight:700;font-family:'JetBrains Mono';}
.wiz-step.on .wiz-num{background:var(--accent);color:var(--accent-ink);}
.wiz-step.done .wiz-num{background:var(--cobalt);color:#fff;}
.wiz-body{padding:22px;min-height:280px;}
.q{font-family:'Archivo';font-weight:800;letter-spacing:-.01em;font-size:17px;margin:0 0 12px;}
.q.mt{margin-top:24px;}
.q .subtle{font-weight:500;font-size:12.5px;color:var(--muted);font-family:'Inter';}
.field{display:block;margin-bottom:6px;}
.field-label{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--muted);margin-bottom:7px;}
.input{width:100%;padding:12px 14px;border:1.5px solid var(--line);border-radius:11px;font-size:15px;background:#fff;color:var(--ink);}
.input:focus{outline:none;border-color:var(--cobalt);box-shadow:0 0 0 3px rgba(43,75,238,.13);}
.input.mono{letter-spacing:.04em;}
.input.sm{padding:8px 10px;font-size:14px;}
select.input{appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B6F79' stroke-width='2.5'><path d='M6 9l6 6 6-6'/></svg>");background-repeat:no-repeat;background-position:right 14px center;padding-right:40px;cursor:pointer;}
.link{color:var(--cobalt);text-decoration:underline;font-weight:600;}
.link:hover{color:var(--ink);}
.hint{font-size:13px;color:var(--cobalt);margin:10px 0 0;line-height:1.5;}
.hint.warn{color:var(--orange);}
.hint.subtle{color:var(--muted);}
.hint.center{text-align:center;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;}
.grid-st{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
@media(min-width:560px){.grid-st{grid-template-columns:repeat(4,1fr);}}
.chip{padding:12px;border:1.5px solid var(--line);border-radius:11px;background:#fff;font-size:13.5px;font-weight:600;color:var(--ink);transition:.12s;text-align:center;}
.chip:hover{border-color:var(--ink);}
.chip.on{background:var(--ink);color:#F4F2EA;border-color:var(--ink);}
.chip.sm{padding:9px 8px;font-size:12.5px;}
.chip.big{display:flex;flex-direction:column;gap:2px;padding:16px 8px;}
.chip.big .big-num{font-size:24px;font-weight:700;}
.chip.big span:last-child{font-size:11px;opacity:.7;text-transform:uppercase;letter-spacing:.1em;}
.st-times{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
@media(min-width:560px){.st-times{grid-template-columns:repeat(4,1fr);}}
.st-time{display:flex;flex-direction:column;gap:5px;}
.st-name{font-size:11.5px;font-weight:600;color:var(--ink-2);}
.range-row{display:flex;align-items:center;gap:14px;}
.range{flex:1;accent-color:var(--cobalt);height:5px;}
.range-val{font-size:18px;font-weight:700;min-width:46px;}
.recap{margin-top:20px;padding:16px;background:var(--paper-2);border-radius:12px;}
.recap h4{margin:0 0 10px;font-family:'Archivo';font-size:13px;text-transform:uppercase;letter-spacing:.08em;}
.recap ul{list-style:none;margin:0;padding:0;display:grid;gap:8px;}
.recap li{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--ink-2);}
.recap li svg{color:var(--cobalt);flex-shrink:0;}
.wiz-nav{display:flex;justify-content:space-between;padding:15px 22px;border-top:1px solid var(--line-2);background:var(--paper-2);}

/* Program */
.program{display:flex;flex-direction:column;gap:14px;padding-top:22px;}
.summary{padding:22px;}
.sum-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:16px;}
.sum-title{font-family:'Archivo';font-weight:900;letter-spacing:-.02em;font-size:clamp(24px,5vw,34px);margin:4px 0 0;}
.countdown{display:flex;align-items:center;gap:10px;background:var(--ink);color:#F4F2EA;padding:10px 16px;border-radius:13px;}
.cd-num{font-size:34px;font-weight:700;color:var(--accent);line-height:1;}
.cd-label{font-size:10.5px;line-height:1.25;text-transform:uppercase;letter-spacing:.08em;color:#B9BAB3;}
.summary .rhythm{margin:6px 0 16px;}
.progress-wrap{margin-bottom:16px;}
.progress-top{display:flex;justify-content:space-between;font-size:12.5px;font-weight:600;color:var(--ink-2);margin-bottom:6px;}
.progress-track{height:8px;background:var(--paper-2);border-radius:99px;overflow:hidden;}
.progress-fill{height:100%;background:var(--cobalt);border-radius:99px;transition:width .4s;}
.sum-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--line-2);border:1px solid var(--line-2);border-radius:12px;overflow:hidden;}
@media(min-width:620px){.sum-grid{grid-template-columns:repeat(3,1fr);}}
.sum-cell{background:var(--card);padding:13px 14px;display:flex;flex-direction:column;gap:4px;}
.sc-l{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:600;}
.sc-v{font-size:16px;font-weight:700;}

/* Run level */
.runlvl{padding:20px 22px;}
.rl-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;}
.rl-level{font-family:'Archivo';font-weight:900;letter-spacing:-.02em;font-size:30px;margin-top:4px;}
.rl-stats{display:flex;gap:18px;flex-wrap:wrap;}
.rl-stat{display:flex;flex-direction:column;gap:2px;}
.rl-l{font-size:10.5px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;font-weight:600;}
.rl-v{font-size:15px;font-weight:700;}
.rl-meter{display:flex;gap:4px;margin:16px 0 12px;}
.rl-seg{flex:1;text-align:center;padding:7px 4px;border-radius:8px;background:var(--paper-2);color:var(--muted);font-size:11px;font-weight:600;transition:.15s;}
.rl-seg.on{background:#cfd6f7;color:var(--ink);}
.rl-seg.cur{background:var(--cobalt);color:#fff;}
.rl-seg span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

/* Limiters */
.lim{padding:20px 22px;}
.lim-empty{font-size:14px;color:var(--ink-2);line-height:1.55;margin:12px 0 0;}
.lim-lead{font-size:15px;color:var(--ink);line-height:1.5;margin:12px 0 4px;}
.lim-bal{font-size:13.5px;color:var(--ink-2);margin:0 0 14px;}
.lim-bars{display:grid;gap:9px;margin-top:8px;}
.lim-row{display:flex;align-items:center;gap:12px;}
.lim-st{font-size:13px;font-weight:600;min-width:150px;}
.lim-track{flex:1;height:9px;background:var(--paper-2);border-radius:99px;overflow:hidden;position:relative;}
.lim-mid{position:absolute;left:50%;top:0;bottom:0;width:2px;background:rgba(22,24,29,.28);z-index:1;}
.lim-fill{height:100%;border-radius:99px;position:relative;}
.lim-row.is-lim .lim-st{color:var(--orange);}
.lim-tag{display:inline-block;margin-left:7px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#fff;background:var(--orange);padding:1px 6px;border-radius:99px;vertical-align:middle;}
.lim-val{font-size:12.5px;font-weight:700;min-width:44px;text-align:right;color:var(--ink-2);}

/* Timeline */
.timeline{padding:20px 22px;}
.tl-bar{display:flex;gap:4px;margin:14px 0 16px;height:62px;}
.tl-seg{--ch:var(--ink);display:flex;flex-direction:column;justify-content:center;gap:3px;padding:0 12px;border-radius:10px;background:var(--ch);color:#fff;min-width:0;}
.tl-name{font-family:'Archivo';font-weight:800;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tl-weeks{font-size:11px;opacity:.85;}
.tl-legend{display:grid;gap:7px;}
.tl-leg-item{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--ink-2);line-height:1.4;}
.dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;}

/* Weights */
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

/* Paywall band */
.paywall-band{display:flex;align-items:center;gap:11px;flex-wrap:wrap;background:var(--ink);color:#F4F2EA;border-radius:14px;padding:15px 18px;cursor:pointer;}
.paywall-band svg{color:var(--accent);flex-shrink:0;}
.paywall-band span{flex:1;font-size:14px;min-width:180px;}
.paywall-band b{color:var(--accent);}

/* Adaptation */
.adapt-band{display:flex;align-items:center;gap:11px;flex-wrap:wrap;background:#cfd6f7;border:1px solid var(--cobalt);border-radius:14px;padding:14px 18px;}
.adapt-band.go{background:var(--accent);border-color:var(--accent-deep);}
.adapt-band svg{color:var(--cobalt);flex-shrink:0;}
.adapt-band.go svg{color:var(--accent-ink);}
.adapt-band span{flex:1;font-size:13.5px;min-width:180px;color:var(--ink);}
/* Feedback séance */
.day-fb{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:9px 13px 11px 50px;border-top:1px solid var(--line-2);background:rgba(43,75,238,.03);}
.day-fb-l{font-size:11.5px;font-weight:600;color:var(--muted);}
.fb-btn{font-size:12px;font-weight:600;padding:5px 11px;border-radius:99px;border:1.5px solid var(--line);background:#fff;color:var(--ink-2);transition:.12s;}
.fb-btn:hover{border-color:var(--ink);}
.fb-btn.on.easy{background:var(--cobalt);border-color:var(--cobalt);color:#fff;}
.fb-btn.on.ok{background:var(--accent-deep);border-color:var(--accent-deep);color:var(--accent-ink);}
.fb-btn.on.hard{background:var(--orange);border-color:var(--orange);color:#fff;}
.day-menu-wrap{position:relative;flex-shrink:0;}
.day-menu-btn{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;color:var(--muted);}
.day-menu-btn:hover{background:var(--paper-2);color:var(--ink);}
.day-menu{position:absolute;right:0;top:34px;z-index:5;background:var(--card);border:1px solid var(--line);border-radius:10px;box-shadow:0 8px 24px rgba(22,24,29,.14);overflow:hidden;min-width:140px;}
.day-menu button{display:flex;align-items:center;gap:8px;width:100%;padding:9px 12px;font-size:13px;font-weight:600;color:var(--ink);text-align:left;}
.day-menu button:hover{background:var(--paper-2);}
.day.skipped{opacity:.6;}
.day.skipped .day-title{text-decoration:line-through;}
.day-cat.sk{opacity:.7;}

/* Weeks */
.weeks{display:flex;flex-direction:column;gap:9px;}
.week{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;transition:.15s;}
.week.open{box-shadow:0 14px 34px -28px rgba(22,24,29,.5);}
.week.race{border-color:var(--accent-deep);box-shadow:0 0 0 2px rgba(185,196,0,.25);}
.week.locked{background:var(--paper-2);}
.week-head{width:100%;display:flex;align-items:center;gap:14px;padding:15px 18px;text-align:left;}
.week-num{font-size:17px;font-weight:700;color:var(--muted);min-width:42px;}
.week.open .week-num{color:var(--ink);}
.week-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px;}
.phase-chip{--ch:var(--ink);align-self:flex-start;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#fff;background:var(--ch);padding:2px 9px;border-radius:99px;}
.week-focus{font-size:13.5px;color:var(--ink-2);line-height:1.4;}
.week-meta{font-size:13px;color:var(--muted);font-weight:700;}
.week-lock{color:var(--muted);}
.day-chev{color:var(--muted);transition:transform .15s;flex-shrink:0;}
.week.open>.week-head .day-chev{transform:rotate(180deg);}
.week-locked-body{display:flex;align-items:center;gap:11px;flex-wrap:wrap;padding:14px 18px;border-top:1px dashed var(--line);font-size:13.5px;color:var(--muted);cursor:pointer;}
.week-locked-body span{flex:1;min-width:140px;}
.week-locked-body svg{color:var(--muted);}

.week-days{padding:6px 14px 14px;display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line-2);}
.day-row{display:flex;gap:10px;align-items:stretch;}
.dow{flex-shrink:0;width:34px;padding-top:14px;font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;}
.day{flex:1;border:1px solid var(--line-2);border-radius:11px;background:#fff;overflow:hidden;min-width:0;transition:.12s;}
.day.checked{border-color:var(--cobalt);background:rgba(43,75,238,.04);}
.day.rest{display:flex;align-items:center;padding:11px 14px;background:var(--paper-2);border-style:dashed;}
.rest-label{font-size:13px;color:var(--muted);font-weight:600;}
.day-head{display:flex;align-items:stretch;}
.day-check{display:grid;place-items:center;padding:0 11px;color:var(--muted);border-right:1px solid var(--line-2);flex-shrink:0;}
.day.checked .day-check{color:var(--cobalt);}
.day-check:hover{color:var(--cobalt);}
.day-open{flex:1;display:flex;align-items:center;gap:11px;padding:11px 13px;text-align:left;min-width:0;}
.day-cat{display:grid;place-items:center;width:26px;height:26px;border-radius:7px;color:#fff;flex-shrink:0;}
.day-main{flex:1;display:flex;flex-direction:column;gap:1px;min-width:0;}
.day-title{font-weight:700;font-size:14px;}
.day-tag{font-size:11.5px;color:var(--muted);}
.day-dur{font-size:13px;font-weight:700;color:var(--ink-2);}
.day-body{padding:4px 14px 14px;border-top:1px solid var(--line-2);display:grid;gap:13px;}
.block-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.09em;color:var(--cobalt);}
.block ul{margin:5px 0 0;padding-left:17px;display:grid;gap:4px;}
.block li{font-size:13.5px;line-height:1.45;color:var(--ink-2);}

.prog-actions{display:flex;gap:10px;justify-content:center;margin-top:10px;flex-wrap:wrap;}

/* Modal */
.modal-bg{position:fixed;inset:0;background:rgba(22,24,29,.55);backdrop-filter:blur(4px);display:grid;place-items:center;z-index:50;padding:18px;}
.modal{position:relative;width:100%;max-width:400px;background:var(--card);border-radius:18px;padding:26px 24px;box-shadow:0 30px 70px -20px rgba(0,0,0,.5);}
.modal-x{position:absolute;top:14px;right:14px;color:var(--muted);}
.modal-x:hover{color:var(--ink);}
.modal-title{font-family:'Archivo';font-weight:900;font-size:22px;letter-spacing:-.02em;margin:6px 0 6px;}
.modal-sub{font-size:14px;color:var(--ink-2);line-height:1.5;margin:0 0 18px;}
.price{display:flex;align-items:baseline;gap:6px;margin:6px 0 14px;}
.price-num{font-size:38px;font-weight:700;color:var(--ink);}
.price-per{font-size:14px;color:var(--muted);}
.price-list{list-style:none;margin:0 0 18px;padding:0;display:grid;gap:9px;}
.price-list li{display:flex;align-items:center;gap:9px;font-size:14px;color:var(--ink-2);}
.price-list svg{color:var(--cobalt);flex-shrink:0;}
.modal .hint{margin-top:12px;}

/* Footer */
.foot{max-width:1000px;margin:0 auto;padding:24px 20px 40px;color:var(--muted);display:flex;flex-direction:column;gap:12px;}
.foot .rhythm{opacity:.55;}
.foot span{font-size:12px;line-height:1.5;}

/* a11y / motion / print */
.mhp :focus-visible{outline:2px solid var(--cobalt);outline-offset:2px;border-radius:6px;}
@media (prefers-reduced-motion:reduce){.mhp *{transition:none!important;}}
@media print{
  .nav,.foot,.prog-actions,.paywall-band,.modal-bg{display:none!important;}
  .mhp{background:#fff;}
  .week,.day{break-inside:avoid;box-shadow:none!important;}
  .week-days{display:flex!important;}
}
`;
