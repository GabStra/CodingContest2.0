import fs from "fs/promises";
import fs_standard from "fs";
import path from "path";
import hash from "hash-it";
import { getRepository } from "../database/datasource";
import { TblEsercizi } from "../database/entities/TblEsercizi";
import { getLines, shuffleArray } from "./utils";
import { TableTasks } from "../database/entities/TableTasks";

function CheckBaseFolder() {
  let folder = process.env.TASKS_CACHE_FOLDER;
  if (!fs_standard.existsSync(folder)) {
    fs_standard.mkdirSync(folder, { recursive: true });
  }
}

async function GetInputFromCache(hashValue) {
  try {
    let inputFilePath = `${process.env.TASKS_CACHE_FOLDER}${path.sep}${hashValue}${INPUT_FILE_SUFFIX}`;
    return await fs.readFile(inputFilePath, "utf8");
  } catch {
    return null;
  }
}

async function GetOutputFromCache(hashValue) {
  try {
    let outputFilePath = `${process.env.TASKS_CACHE_FOLDER}${path.sep}${hashValue}${OUTPUT_FILE_SUFFIX}`;
    return await fs.readFile(outputFilePath, "utf8");
  } catch {
    return null;
  }
}

export async function GetExerciseInputOutput(title, courseId) {
  CheckBaseFolder();
  let hashValue = hash({ title: title, courseId: courseId });
  let input = await GetInputFromCache(hashValue);
  let output = await GetOutputFromCache(hashValue);
  if ([input, output].some((item) => item === null)) {
    let tasksRepo = await getRepository<TableTasks>(TableTasks);
    let esercizio = await tasksRepo.findOne({
      select: ["taskInput", "taskOutput"],
      where: {
        title: title,
      },
    });

    if (!esercizio) throw new Error("Exercise not found");
    input = esercizio.taskInput;
    output = esercizio.taskOutput;
    setImmediate(async () => {
      await SaveFileToTaskCacheFolder(
        `${hashValue}${INPUT_FILE_SUFFIX}`,
        input
      );
      await SaveFileToTaskCacheFolder(
        `${hashValue}${OUTPUT_FILE_SUFFIX}`,
        output
      );
    });
  }

  return { input: input, output: output };
}

const INPUT_FILE_SUFFIX = "_input.txt";
const OUTPUT_FILE_SUFFIX = "_output.txt";

export async function getExerciseTaskCount(title, courseId) {
  let eserciziRepo = await getRepository<TblEsercizi>(TblEsercizi);
  let esercizio = await eserciziRepo.findOne({
    select: ["task"],
    where: {
      title: title,
      idCorso: courseId,
    },
  });

  return esercizio.task;
}

export async function SaveFileToTaskCacheFolder(fileName, file) {
  await fs.writeFile(
    `${process.env.TASKS_CACHE_FOLDER}${path.sep}${fileName}`,
    file
  );
}

export async function getRandomizedExerciseInputOutput(title, courseId, tasks) {
  let { input, output } = await GetExerciseInputOutput(title, courseId);
  let inputLines = getLines(input);
  let outputLines = getLines(output);

  let totalLines = Math.min(inputLines.length, outputLines.length);
  let indexArray = Array.from(Array(totalLines).keys());

  shuffleArray(indexArray);
  indexArray = indexArray.slice(0, tasks);
  return {
    input: inputLines
      .filter((_, index) => indexArray.includes(index))
      .join("\r\n"),
    output: outputLines
      .filter((_, index) => indexArray.includes(index))
      .join("\r\n"),
  };
}

export function getExerciseScore(
  outputExercise: string,
  expectedOutput: string,
  tasks
) {
  const outputExerciseLines = getLines(outputExercise);
  const expectedOutputLines = getLines(expectedOutput);

  let results = new Array<boolean>(tasks).fill(false);
  if (!outputExerciseLines || outputExerciseLines.length === 0) return results;

  for (let i = 0; i < tasks; i++) {
    try {
      results[i] = outputExerciseLines[i] === expectedOutputLines[i];
    } catch {
      continue;
    }
  }
  return results;
}
