import { exec } from "promisify-child-process";
import fs from "fs/promises";
import { CppRequest, CppResponse } from "../../Shared/compiled_proto/cpp";

const FILE_NAME = "app.cpp";

export async function compileCpp(request: CppRequest) {
  await fs.writeFile("app.cpp", request.code);
  const { stdout, stderr } = await exec(`g++ ${FILE_NAME}`);
  return stdout;
}

export async function executeProgram(request: CppRequest) {
  await fs.writeFile("input.txt", request.input);
  const { stdout, stderr } = await exec(`./a.out`);
  return stdout;
}

export async function runCpp(request: CppRequest): Promise<CppResponse> {
  try {
    // const controller = new AbortController();
    // const { signal } = controller;
    await compileCpp(request);
    let programOutput = await executeProgram(request);
    return {
      id: request.id,
      console: programOutput,
      output: await fs.readFile("output.txt", "utf8"),
    } as CppResponse;
  } catch (err: any) {
    return {
      id: request.id,
      timeout: !!err.signal && !err.stderr,
      error: err.stderr?.replaceAll(FILE_NAME + ":", "").trim(),
    } as CppResponse;
  }
}
