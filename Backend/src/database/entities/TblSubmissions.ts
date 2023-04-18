import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { TblEsercizi } from "./TblEsercizi";

@Entity("tbl_submissions", { schema: "codingcontest2" })
export class TblSubmissions {
  @Column("int", { name: "userId" })
  userId: number;

  @Column("longtext", { name: "code" })
  code: string;

  @Column("int", { name: "score", default: () => "'0'" })
  score: number;

  @Column("text", { name: "submissionTime" })
  submissionTime: string;

  @Column("int", { name: "submissionCounter", default: () => "'0'" })
  submissionCounter: number;

  @Column("text", { name: "submissionCounter", default: () => "'0'" })
  executionTime: number;

  @Column("varchar", { name: "titoloEsercizio", length: 50 })
  titoloEsercizio: string;

  @Column("int", { name: "id_corso" })
  idCorso: number;

  @ManyToOne(() => TblEsercizi)
  @JoinColumn([
    { name: "titoloEsercizio", referencedColumnName: "title" },
    { name: "id_corso", referencedColumnName: "id_corso" },
  ])
  esercizio: TblEsercizi;
}
