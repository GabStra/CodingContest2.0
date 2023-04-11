import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TblEsercizi } from "./TblEsercizi";

@Entity("tbl_tags", { schema: "codingcontest2" })
export class TblTags {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "tag", length: 30 })
  tag: string;

  @Column("int", { name: "id_corso", nullable: true })
  idCorso: number | null;
}
