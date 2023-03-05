import { ServerCredentials } from "@grpc/grpc-js";
import dotenv from "dotenv";
dotenv.config();
import { CallContext, ChannelOptions, createServer } from "nice-grpc";
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
    async runCpp(
      request: CppRequest,
      context: CallContext
    ): Promise<DeepPartial<CppResponse>> {
      let start = process.hrtime();
      let response = await runCpp(request, context.signal);
      let elapsed = process.hrtime(start)[0];
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
