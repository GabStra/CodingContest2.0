export class RemoteExecutionResult {
  stdout: string;
  stderr: string;
  results: boolean[];

  constructor(obj?) {
    obj && Object.assign(this, obj);
  }
}
