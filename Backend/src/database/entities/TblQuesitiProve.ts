import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tbl_quesiti_prove", { schema: "codingcontest2" })
export class TblQuesitiProve {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "id_appello" })
  idAppello: number;

  @Column("varchar", { name: "titolo", nullable: true, length: 200 })
  titolo: string | null;

  @Column("int", {
    name: "durata_totale",
    nullable: true,
    comment: "durata massima dell'esame, espressa in minuti",
  })
  durataTotale: number | null;

  @Column("int", {
    name: "durata_domande",
    nullable: true,
    comment: "durata massima di un quesito, espressa in secondi",
  })
  durataDomande: number | null;

  @Column("int", { name: "dinamica", default: () => "'1'" })
  dinamica: number;

  @Column("varchar", {
    name: "punti_domanda",
    length: 10,
    default: () => "'1'",
  })
  puntiDomanda: string;

  @Column("varchar", {
    name: "punti_opzione",
    length: 10,
    default: () => "'0'",
  })
  puntiOpzione: string;

  @Column("varchar", {
    name: "penalita_domanda",
    length: 10,
    default: () => "'0'",
  })
  penalitaDomanda: string;

  @Column("varchar", {
    name: "penalita_opzione",
    length: 10,
    default: () => "'0'",
  })
  penalitaOpzione: string;
}
