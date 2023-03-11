import { TblUsers } from "./entities/TblUsers";
import { TblAdmin } from "./entities/TblAdmin";
import { TblAppelli } from "./entities/TblAppelli";
import { DataSource, EntityTarget, ObjectLiteral } from "typeorm";

const appDataSource = new DataSource({
  type: "mariadb",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "root",
  database: "codingcontest2",
  synchronize: false,
  entities: [TblUsers, TblAdmin, TblAppelli],
});

export async function getRepository<Type>(target: EntityTarget<Type>) {
  if (!appDataSource.isInitialized) await appDataSource.initialize();
  return appDataSource.getRepository(target);
}
