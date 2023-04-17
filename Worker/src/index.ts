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
  HealthRequest,
  HealthResponse,
  CppResponse_TaskStatus,
  CppResponse_TaskType,
} from "shared-ts/compiled_proto/cpp";
import VitalSigns from "vitalsigns";
import { runCpp } from "./logic";

const cppServiceImpl: CppServiceImplementation = {
  async runCpp(
    request: CppRequest,
    context: CallContext
  ): Promise<DeepPartial<CppResponse>> {
    return await runCpp(request, context.signal);
  },

  async isHealthy(
    request: HealthRequest,
    context: CallContext
  ): Promise<DeepPartial<HealthResponse>> {
    return {
      isHealthy: vitalSigns.isHealthy(),
    } as HealthResponse;
  },
};

async function main() {
  const server = createServer();
  server.add(CppDefinition, cppServiceImpl);
  await server.listen("0.0.0.0:80", ServerCredentials.createInsecure());
}

let vitalSigns = new VitalSigns();
vitalSigns.monitor("cpu");
vitalSigns.monitor("tick");
vitalSigns.unhealthyWhen("cpu", "loadAvg15").greaterThan(90);
vitalSigns.unhealthyWhen("tick", "maxMs").greaterThan(500);
main();
