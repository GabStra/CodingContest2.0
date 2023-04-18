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
