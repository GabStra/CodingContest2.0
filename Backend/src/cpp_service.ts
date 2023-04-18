import { MessageChannel, Worker, MessagePort } from "worker_threads";
import {
  CppRequest,
  CppResponse,
  CppResponse_TaskStatus,
} from "shared/compiled_proto/cpp";
import { PortMessage, Recipient } from "./message/port_sharing";
import {
  TaskManagerMessage,
  TaskManagerMessageType,
} from "./message/task_manager";
import { EventEmitter2 } from "eventemitter2";
import fs from "fs/promises";
import {
  CppServiceMessage,
  CppServiceMessageType,
} from "./message/cpp_service";
import {
  LoadBalancerMessage,
  LoadBalancerMessageType,
  TaskStatus,
} from "./message/load_balancer";

export class CppService {
  private taskResultEmitter: EventEmitter2;
  private checkTaskStatusEmitter: EventEmitter2;
  private taskAbortEmitter: EventEmitter2;
  private dockerManagerWorker: Worker;
  private loadBalancerWorker: Worker;
  private taskManagerWorker: Worker;
  private loadBalancerPort: MessagePort;
  private taskManagerPort: MessagePort;
  constructor() {
    this.taskResultEmitter = new EventEmitter2();
    this.taskAbortEmitter = new EventEmitter2();
    this.checkTaskStatusEmitter = new EventEmitter2();
    this.dockerManagerWorker = new Worker(
      "./dist/src/worker/docker_manager.js"
    );
    this.loadBalancerWorker = new Worker("./dist/src/worker/load_balancer.js");
    this.taskManagerWorker = new Worker("./dist/src/worker/task_manager.js");

    const loadBalancerTaskManagerChannel = new MessageChannel();
    const dockerManagerTaskManagerChannel = new MessageChannel();
    const dockerManagerLoadBalancerChannel = new MessageChannel();
    const cppServiceLoadBalancerChannel = new MessageChannel();
    const cppServiceTaskManagerChannel = new MessageChannel();

    // SET LOAD BALANCER <-> TASK MANAGER
    this.loadBalancerWorker.postMessage(
      {
        recipient: Recipient.TaskManager,
        port: loadBalancerTaskManagerChannel.port1,
      } as PortMessage,
      [loadBalancerTaskManagerChannel.port1]
    );

    this.taskManagerWorker.postMessage(
      {
        recipient: Recipient.LoadBalancer,
        port: loadBalancerTaskManagerChannel.port2,
      } as PortMessage,
      [loadBalancerTaskManagerChannel.port2]
    );

    // SET DOCKER MANAGER <-> TASK MANAGER
    this.dockerManagerWorker.postMessage(
      {
        recipient: Recipient.TaskManager,
        port: dockerManagerTaskManagerChannel.port1,
      } as PortMessage,
      [dockerManagerTaskManagerChannel.port1]
    );

    this.taskManagerWorker.postMessage(
      {
        recipient: Recipient.DockerManager,
        port: dockerManagerTaskManagerChannel.port2,
      } as PortMessage,
      [dockerManagerTaskManagerChannel.port2]
    );

    // SET DOCKER MANAGER <-> LOAD BALANCER
    this.dockerManagerWorker.postMessage(
      {
        recipient: Recipient.LoadBalancer,
        port: dockerManagerLoadBalancerChannel.port1,
      } as PortMessage,
      [dockerManagerLoadBalancerChannel.port1]
    );

    this.loadBalancerWorker.postMessage(
      {
        recipient: Recipient.DockerManager,
        port: dockerManagerLoadBalancerChannel.port2,
      } as PortMessage,
      [dockerManagerLoadBalancerChannel.port2]
    );

    // SET CPP SERVICE <-> LOAD BALANCER
    this.loadBalancerPort = cppServiceLoadBalancerChannel.port1;
    this.loadBalancerWorker.postMessage(
      {
        recipient: Recipient.CppService,
        port: cppServiceLoadBalancerChannel.port2,
      } as PortMessage,
      [cppServiceLoadBalancerChannel.port2]
    );

    this.loadBalancerPort.on("message", async (msg: LoadBalancerMessage) => {
      switch (msg.type) {
        case LoadBalancerMessageType.TaskStatus:
          this.checkTaskStatusEmitter.emit(msg.taskId, msg.taskStatus);
          return;
      }
    });

    // SET CPP SERVICE <-> TASK MANAGER
    this.taskManagerPort = cppServiceTaskManagerChannel.port1;
    this.taskManagerWorker.postMessage(
      {
        recipient: Recipient.CppService,
        port: cppServiceTaskManagerChannel.port2,
      } as PortMessage,
      [cppServiceTaskManagerChannel.port2]
    );

    this.taskManagerPort.on("message", async (msg: TaskManagerMessage) => {
      if (msg.type === TaskManagerMessageType.TaskAbort) {
        this.taskAbortEmitter.emit(msg.taskId);
        this.taskResultEmitter.emit(msg.taskId, {
          id: msg.taskId,
          taskStatus: CppResponse_TaskStatus.ABORTED,
        } as CppResponse);
      } else {
        this.taskResultEmitter.emit(msg.cppResponse.id, msg.cppResponse);
      }
    });
  }

  async runCpp(cppRequest: CppRequest) {
    let base = await fs.readFile("static/app.cpp", "utf8");
    let source = base.replace("{code}", cppRequest.code);

    let cpp: CppRequest = {
      id: cppRequest.id,
      code: source,
      input: cppRequest.input,
    };
    this.loadBalancerPort.postMessage({
      type: CppServiceMessageType.StartTask,
      cppRequest: cpp,
    } as CppServiceMessage);

    let emitterOutcome = await this.taskResultEmitter.waitFor(cpp.id);
    return emitterOutcome[0] as CppResponse;
  }

  async checkTask(taskId: string) {
    this.loadBalancerPort.postMessage({
      type: CppServiceMessageType.CheckTask,
      taskId: taskId,
    } as CppServiceMessage);

    let emitterOutcome = await this.checkTaskStatusEmitter.waitFor(
      taskId,
      10000
    );
    return emitterOutcome[0] as TaskStatus;
  }

  async stopTask(taskId: string) {
    this.taskManagerPort.postMessage({
      type: CppServiceMessageType.StopTask,
      taskId: taskId,
    } as CppServiceMessage);

    await this.taskAbortEmitter.waitFor(taskId, 10000);
    return true;
  }
}
