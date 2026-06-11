export type LeaderboardEntry = {
  rank: number;
  username: string;
  xp: number;
  streak: number;
  country: string;
  avatar: string;
};

export const globalLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "FootyKing", xp: 24850, streak: 87, country: "🇵🇹", avatar: "FK" },
  { rank: 2, username: "GoldenBoot", xp: 22310, streak: 64, country: "🇧🇷", avatar: "GB" },
  { rank: 3, username: "MidfieldMaestro", xp: 19980, streak: 45, country: "🇪🇸", avatar: "MM" },
  { rank: 4, username: "CatenaccioPro", xp: 18420, streak: 39, country: "🇮🇹", avatar: "CP" },
  { rank: 5, username: "TikiTaka", xp: 17560, streak: 28, country: "🇪🇸", avatar: "TT" },
  { rank: 6, username: "Joga_Bonito", xp: 16200, streak: 22, country: "🇧🇷", avatar: "JB" },
  { rank: 7, username: "DerEisbrecher", xp: 15400, streak: 19, country: "🇩🇪", avatar: "DE" },
  { rank: 8, username: "RedDevil99", xp: 14210, streak: 17, country: "🇬🇧", avatar: "RD" },
  { rank: 9, username: "BenficaSempre", xp: 13380, streak: 31, country: "🇵🇹", avatar: "BS" },
  { rank: 10, username: "ParisianBlues", xp: 12640, streak: 14, country: "🇫🇷", avatar: "PB" },
];

export const dailyLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "ScudettoLover", xp: 980, streak: 1, country: "🇮🇹", avatar: "SL" },
  { rank: 2, username: "Joga_Bonito", xp: 920, streak: 22, country: "🇧🇷", avatar: "JB" },
  { rank: 3, username: "FootyKing", xp: 890, streak: 87, country: "🇵🇹", avatar: "FK" },
  { rank: 4, username: "TikiTaka", xp: 840, streak: 28, country: "🇪🇸", avatar: "TT" },
  { rank: 5, username: "BenficaSempre", xp: 790, streak: 31, country: "🇵🇹", avatar: "BS" },
];

export const weeklyLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "FootyKing", xp: 5430, streak: 87, country: "🇵🇹", avatar: "FK" },
  { rank: 2, username: "MidfieldMaestro", xp: 4980, streak: 45, country: "🇪🇸", avatar: "MM" },
  { rank: 3, username: "GoldenBoot", xp: 4620, streak: 64, country: "🇧🇷", avatar: "GB" },
  { rank: 4, username: "BenficaSempre", xp: 4310, streak: 31, country: "🇵🇹", avatar: "BS" },
  { rank: 5, username: "CatenaccioPro", xp: 3990, streak: 39, country: "🇮🇹", avatar: "CP" },
];
