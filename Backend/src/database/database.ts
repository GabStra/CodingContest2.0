import { DataSource } from "typeorm";

export function CreateDataSource() {
  return new DataSource(require("./ormconfig.json"));
}
