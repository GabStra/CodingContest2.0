import { Column, Entity } from "typeorm";

@Entity("tbl_log", { schema: "codingcontest2" })
export class TblLog {
  @Column("varchar", { primary: true, name: "user", length: 30 })
  user: string;

  @Column("int", { primary: true, name: "req" })
  req: number;

  @Column("varchar", { primary: true, name: "time", length: 30 })
  time: string;

  @Column("varchar", { name: "ip", length: 30 })
  ip: string;
}
