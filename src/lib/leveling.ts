/**
 * Level progression — quadratic curve so early levels feel snappy
 * and later levels reward dedication.
 *
 *   level N requires:  100 * N * (N+1) / 2  total XP
 *   level 1 → 100xp  · level 2 → 300xp · level 3 → 600xp · level 5 → 1500xp
 */

export type LevelInfo = {
  level: number;
  currentXp: number;          // XP into the current level
  neededXp: number;           // XP required to reach next level
  totalXpForLevel: number;    // cumulative XP threshold for current level
  totalXpForNext: number;     // cumulative XP threshold for next level
  progress: number;           // 0..1 within the current level
  title: string;
};

const TITLES = [
  "Estreante", "Reservista", "Titular", "Capitão", "Craque",
  "Estrela", "Maestro", "Mago", "Lenda", "Imortal",
];

export function levelTitle(level: number): string {
  return TITLES[Math.min(level - 1, TITLES.length - 1)] ?? "Imortal";
}

/** Total cumulative XP to reach the START of `level`. Level 1 starts at 0. */
function thresholdFor(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return 100 * n * (n + 1) / 2;
}

export function getLevel(xp: number): LevelInfo {
  // Solve for largest L where threshold(L) <= xp.
  let level = 1;
  while (thresholdFor(level + 1) <= xp) level++;
  const totalXpForLevel = thresholdFor(level);
  const totalXpForNext = thresholdFor(level + 1);
  const neededXp = totalXpForNext - totalXpForLevel;
  const currentXp = xp - totalXpForLevel;
  return {
    level,
    currentXp,
    neededXp,
    totalXpForLevel,
    totalXpForNext,
    progress: neededXp === 0 ? 1 : currentXp / neededXp,
    title: levelTitle(level),
  };
}

export function leveledUp(prevXp: number, nextXp: number): boolean {
  return getLevel(nextXp).level > getLevel(prevXp).level;
}
