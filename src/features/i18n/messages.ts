export const LANGS = ["en", "fr"] as const;
export type Lang = (typeof LANGS)[number];

const en = {
  tagline: "Pin the capital. 10 countries a day.",
  puzzle: (n: number) => `Daily #${n}`,
  howToPlay: "How to play",
  rules: [
    "A country lights up on the map.",
    "You have 5 seconds to click where its capital is.",
    "The closer your pin, the more points (up to 1,000). Distances count relative to the country's size.",
  ],
  start: "Start",
  getReady: "Get ready",
  round: (i: number, n: number) => `Round ${i}/${n}`,
  whereIsCapital: "Where is the capital of",
  tooSlow: "Too slow!",
  km: (d: number) => `${d.toLocaleString("en")} km`,
  points: (p: number) => `${p.toLocaleString("en")} pts`,
  total: "Total score",
  comeBack: "Come back tomorrow for a new challenge.",
  nextIn: (t: string) => `Next challenge in ${t}`,
  played: "Played",
  streak: "Streak",
  maxStreak: "Best streak",
  best: "Best score",
  noAnswer: "no answer",
  language: "Language",
};

export type Messages = typeof en;

const fr: Messages = {
  tagline: "Trouvez la capitale. 10 pays par jour.",
  puzzle: (n) => `Défi n°${n}`,
  howToPlay: "Comment jouer",
  rules: [
    "Un pays s'allume sur la carte.",
    "Vous avez 5 secondes pour cliquer à l'emplacement de sa capitale.",
    "Plus votre repère est proche, plus vous marquez de points (jusqu'à 1 000). La distance compte selon la taille du pays.",
  ],
  start: "Commencer",
  getReady: "Préparez-vous",
  round: (i, n) => `Manche ${i}/${n}`,
  whereIsCapital: "Où se trouve la capitale de ce pays :",
  tooSlow: "Trop tard !",
  km: (d) => `${d.toLocaleString("fr")} km`,
  points: (p) => `${p.toLocaleString("fr")} pts`,
  total: "Score total",
  comeBack: "Revenez demain pour un nouveau défi.",
  nextIn: (t) => `Prochain défi dans ${t}`,
  played: "Parties",
  streak: "Série",
  maxStreak: "Meilleure série",
  best: "Meilleur score",
  noAnswer: "pas de réponse",
  language: "Langue",
};

export const messages: Record<Lang, Messages> = { en, fr };
