import { TblUsers } from "./entities/TblUsers";
import { TblAdmin } from "./entities/TblAdmin";
import { TblAppelli } from "./entities/TblAppelli";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "mariadb",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "root",
  database: "codingcontest2",
  synchronize: false,
  entities: [TblUsers],
});
