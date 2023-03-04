import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import uuid from "uuid-random";
import axios from "axios";
import { PriorityRoundRobin, RandomRoundRobin } from "round-robin-js";

import fs from "fs/promises";

import {
  initDocker,
  ContainersData,
  HealthCheck,
  ContainerData,
} from "./manager";
import { CppRequest } from "../../Shared/compiled_proto/cpp";

const app: Express = express();
const port = process.env.PORT;

const fileNames = ["code.cpp"];
async function compileAndRunCpp(
  codeFilename: string,
  container: ContainerData
) {
  let base = await fs.readFile("app.cpp", "utf8");
  let code = await fs.readFile(codeFilename, "utf8");
  let source = base.replace("{code}", code);

  let cpp: CppRequest = {
    id: uuid(),
    code: source,
    input: await fs.readFile("input.txt", "utf8"),
  };

  let start = process.hrtime();
  let response = await container.client.runCpp(cpp);
  let elapsed = process.hrtime(start)[0];
  let hasFailed = !response.output;
  console.log(
    "Executed in:",
    elapsed + "s ",
    hasFailed ? "F" : "S",
    codeFilename
  );
}
async function main() {
  try {
    let docker = await initDocker(
      Number(process.env.CONTAINER_COUNT),
      Number(process.env.CONTAINER_MEMORY)
    );

    await new Promise((r) => setTimeout(r, 5000));
    /* HealthCheck();
    await new Promise((r) => setTimeout(r, 5000));
    let availableContainers = new PriorityRoundRobin<ContainerData>(
      (a: ContainerData, b: ContainerData) => a.getLoad() - b.getLoad(),
      ContainersData
    ); */

    let availableContainers = new RandomRoundRobin(ContainersData);
    while (true) {
      let container = availableContainers.next().value;
      let file = fileNames[0];
      //container.status!.isRunning = true;
      compileAndRunCpp(file, container);
      await new Promise((r) => setTimeout(r, 5000));
    }
  } catch (err) {
    console.log(err);
    /*await new Promise((r) => setTimeout(r, 5000));
    main(); */
  }
}

main();
