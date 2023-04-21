import { LEVEL } from "../constants/levels";

export function fromTotalScoreToLevel(totalScore: number): LEVEL {
  let level = Math.floor(totalScore / 50);
  if (level > LEVEL.TEN) return LEVEL.TEN;
  if (level < LEVEL.ZERO) return LEVEL.ZERO;
  return level as LEVEL;
}

export function fromLevelToTotalScore(level: LEVEL): number {
  return level * 50;
}
