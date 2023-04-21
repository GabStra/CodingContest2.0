import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TblEsercizi } from "./TblEsercizi";

@Entity("tbl_submissions", { schema: "codingcontest2" })
export class TblSubmissions {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "userId" })
  userId: number;

  @Column("longtext", { name: "code", nullable: true })
  code: string | null;

  @Column("int", { name: "score" })
  score: number;

  @Column("text", { name: "submissionTime", nullable: true })
  submissionTime: string | null;

  @Column("text", { name: "executionTime", nullable: true })
  executionTime: string | null;

  @Column("int", { name: "submissionCounter" })
  submissionCounter: number;

  @Column("varchar", { name: "exercise_title" })
  exerciseTitle: string;

  @Column("int", { name: "id_corso" })
  idCorso: number;
}
