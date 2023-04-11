import { exec } from "promisify-child-process";
import fs from "fs/promises";
import {
  CppRequest,
  CppResponse,
  CppResponse_TaskStatus,
  CppResponse_TaskType,
} from "shared/compiled_proto/cpp";

const FILE_NAME = "app.cpp";

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export async function compileCpp(
  request: CppRequest,
  signal: AbortSignal,
  timeout?: number
) {
  await fs.writeFile("app.cpp", request.code);
  return await exec(`g++ ${FILE_NAME}`, { signal: signal, timeout: timeout });
}

export async function executeProgram(
  request: CppRequest,
  signal: AbortSignal,
  timeout?: number
) {
  await fs.writeFile("input.txt", request.input);
  return await exec(`./a.out`, { signal: signal, timeout: timeout });
}

async function ManageError(id, taskType, abortSignal: AbortSignal, error) {
  try {
    if (abortSignal.aborted) {
      return {
        id: id,
        taskType: taskType,
        taskStatus: CppResponse_TaskStatus.ABORTED,
      } as CppResponse;
    }

    if (!error.signal) {
      return {
        id: id,
        taskType: taskType,
        taskStatus: CppResponse_TaskStatus.ERROR,
        stderr: (await streamToString(error.stderr))
          .replaceAll(FILE_NAME + ":", "")
          .trim(),
      } as CppResponse;
    }

    if (error.killed) {
      return {
        id: id,
        taskType: taskType,
        taskStatus: CppResponse_TaskStatus.TIMEOUT,
      } as CppResponse;
    }
    throw 1;
  } catch {
    return {
      id: id,
      taskType: taskType,
      taskStatus: CppResponse_TaskStatus.FAILED,
    } as CppResponse;
  }
}

export async function runCpp(
  request: CppRequest,
  abortSignal: AbortSignal
): Promise<CppResponse> {
  try {
    await compileCpp(request, abortSignal);
  } catch (error) {
    return await ManageError(
      request.id,
      CppResponse_TaskType.COMPILE,
      abortSignal,
      error
    );
  }

  try {
    let { stdout } = await executeProgram(request, abortSignal, 120000);
    return {
      id: request.id,
      taskType: CppResponse_TaskType.RUN,
      taskStatus: CppResponse_TaskStatus.SUCCEDED,
      stdout: await streamToString(stdout),
      output: await fs.readFile("output.txt", "utf8"),
    } as CppResponse;
  } catch (error) {
    return await ManageError(
      request.id,
      CppResponse_TaskType.RUN,
      abortSignal,
      error
    );
  }
}
