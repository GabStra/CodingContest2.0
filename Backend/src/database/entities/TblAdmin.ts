import { Column, Entity } from "typeorm";

@Entity("tbl_admin", { schema: "codingcontest2" })
export class TblAdmin {
  @Column("varchar", { primary: true, name: "userID", length: 50 })
  userId: string;

  @Column("int", { name: "level", default: () => "'1'" })
  level: number;
}
