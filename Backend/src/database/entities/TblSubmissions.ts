import { Column, Entity } from "typeorm";

@Entity("tbl_submissions", { schema: "codingcontest2" })
export class TblSubmissions {
  @Column("int", { name: "userId" })
  userId: number;

  @Column("int", { name: "exerciseId" })
  exerciseId: number;

  @Column("longtext", { name: "code" })
  code: string;

  @Column("int", { name: "score", default: () => "'0'" })
  score: number;

  @Column("text", { name: "submissionTime" })
  submissionTime: string;

  @Column("int", { name: "submissionCounter", default: () => "'0'" })
  submissionCounter: number;
}
