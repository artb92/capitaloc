export const LANGS = ["en", "fr"] as const;
export type Lang = (typeof LANGS)[number];

const en = {
  title: "Pin the capital.",
  subtitle: "Ten countries a day, five seconds each.",
  puzzle: (n: number) => `Daily #${n}`,
  howToPlay: "How to play",
  rules: [
    "A country lights up on the map.",
    "Click where you think its capital is.",
    "Closer and faster pins score more, up to 1,000. Distance counts relative to the country's size.",
  ],
  start: "Start today's challenge",
  getReady: "Get ready",
  round: (i: number, n: number) => `Round ${i} of ${n}`,
  tooSlow: "Out of time",
  km: (d: number) => `${d.toLocaleString("en")} km`,
  points: (p: number) => `${p.toLocaleString("en")} pts`,
  total: "Today's score",
  outOf: (max: number) => `out of ${max.toLocaleString("en")}`,
  comeBack: "A new challenge starts at midnight.",
  nextIn: (t: string) => `Next one in ${t}`,
  played: "Played",
  streak: "Streak",
  maxStreak: "Best streak",
  best: "Best score",
  noAnswer: "No answer",
  capitalPhoto: "Photo of the capital",
  seconds: (s: number) => `${s.toLocaleString("en", { maximumFractionDigits: 1 })} s`,
  language: "Language",
};

export type Messages = typeof en;

const fr: Messages = {
  title: "Placez la capitale.",
  subtitle: "Dix pays par jour, cinq secondes chacun.",
  puzzle: (n) => `Défi n°${n}`,
  howToPlay: "Comment jouer",
  rules: [
    "Un pays s'allume sur la carte.",
    "Cliquez là où vous pensez que se trouve sa capitale.",
    "Plus votre repère est proche et rapide, plus vous marquez, jusqu'à 1 000. La distance compte selon la taille du pays.",
  ],
  start: "Lancer le défi du jour",
  getReady: "Préparez-vous",
  round: (i, n) => `Manche ${i} sur ${n}`,
  tooSlow: "Temps écoulé",
  km: (d) => `${d.toLocaleString("fr")} km`,
  points: (p) => `${p.toLocaleString("fr")} pts`,
  total: "Score du jour",
  outOf: (max) => `sur ${max.toLocaleString("fr")}`,
  comeBack: "Un nouveau défi commence à minuit.",
  nextIn: (t) => `Prochain dans ${t}`,
  played: "Parties",
  streak: "Série",
  maxStreak: "Meilleure série",
  best: "Meilleur score",
  noAnswer: "Pas de réponse",
  capitalPhoto: "Photo de la capitale",
  seconds: (s) => `${s.toLocaleString("fr", { maximumFractionDigits: 1 })} s`,
  language: "Langue",
};

export const messages: Record<Lang, Messages> = { en, fr };
