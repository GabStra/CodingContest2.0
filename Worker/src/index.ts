import { ServerCredentials } from "@grpc/grpc-js";
import dotenv from "dotenv";
dotenv.config();
import { ChannelOptions, createServer } from "nice-grpc";
import {
  CppRequest,
  CppResponse,
  CppServiceImplementation,
  DeepPartial,
  CppDefinition,
} from "../../Shared/compiled_proto/cpp";

import { runCpp } from "./logic";

async function main() {
  const cppServiceImpl: CppServiceImplementation = {
    async runCpp(request: CppRequest): Promise<DeepPartial<CppResponse>> {
      let start = process.hrtime();
      let response = await runCpp(request);
      let elapsed = process.hrtime(start)[0];
      console.log("Executed in:", elapsed + "s ", "Output:", !!response.output);
      return response;
    },
  };

  try {
    let options: ChannelOptions;
    const server = createServer();
    server.add(CppDefinition, cppServiceImpl);
    await server.listen("0.0.0.0:80", ServerCredentials.createInsecure());
  } catch (err) {
    console.log(err);
  }
}

main();
