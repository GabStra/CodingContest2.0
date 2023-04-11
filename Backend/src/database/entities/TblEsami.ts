import { Column, Entity } from "typeorm";

@Entity("tbl_esami", { schema: "codingcontest2" })
export class TblEsami {
  @Column("varchar", { name: "title", nullable: true, length: 50 })
  title: string | null;

  @Column("varchar", { primary: true, name: "userName", length: 20 })
  userName: string;

  @Column("int", { name: "punteggio", default: () => "'0'" })
  punteggio: number;

  @Column("varchar", { name: "time", nullable: true, length: 15 })
  time: string | null;

  @Column("varchar", { primary: true, name: "code", length: 20 })
  code: string;
}
