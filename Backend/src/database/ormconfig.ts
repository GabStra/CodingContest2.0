import { DataSourceOptions } from "typeorm";

export const ormConfig: DataSourceOptions = {
  type: "mariadb",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "root",
  database: "codingcontest2",
  synchronize: false,
  entities: [__dirname + "/../**/*.entity.js"],
};
