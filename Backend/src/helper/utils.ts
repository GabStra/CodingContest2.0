import { getRepository } from "../database/datasource";
import { TblEsercizi } from "../database/entities/TblEsercizi";
import { TblSubmissions } from "../database/entities/TblSubmissions";
export function millisecFromProcessHrTime(hrTime: [number, number]) {
  return hrTime[0] * 1000 + hrTime[1] / 1000000;
}

export async function WaitForMs(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export function getLines(str: string): string[] {
  return str.match(/[^\r\n]+/g);
}

export async function getCurrentTotalScore(userId: number, courseId: number) {
  let submissionsRepo = await getRepository<TblSubmissions>(TblSubmissions);
  let results = await submissionsRepo.find({
    select: {
      score: true,
      exerciseTitle: true,
    },
    where: {
      userId: userId,
      idCorso: courseId,
    },
  });

  if (results.length === 0) return 0;

  let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);
  let exercises = await eserciziRepo.find({
    select: ["title", "level"],
    where: {
      idCorso: courseId,
    },
  });

  let exerciseSubmitted = results.map((item) => item.exerciseTitle);

  let levelByExerciseTitle = exercises
    .filter((item) => exerciseSubmitted.includes(item.title))
    .reduce((acc, item) => ({ ...acc, [item.title]: item.level }), {});

  let totalScore = results.reduce(
    (acc, item) =>
      acc + (item.score / 10) * (levelByExerciseTitle[item.exerciseTitle] + 1),
    0
  );

  return totalScore;
}
