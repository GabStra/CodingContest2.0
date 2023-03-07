export function millisecFromProcessHrTime(hrTime: [number, number]) {
  return hrTime[0] * 1000 + hrTime[1] / 1000000;
}

export async function WaitForMs(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
