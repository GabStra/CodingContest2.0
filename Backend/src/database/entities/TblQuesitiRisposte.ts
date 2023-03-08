import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tbl_quesiti_risposte", { schema: "codingcontest2" })
export class TblQuesitiRisposte {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "domanda" })
  domanda: number;

  @Column("int", { name: "corretta" })
  corretta: number;

  @Column("text", { name: "testo" })
  testo: string;
}
