import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TblAssocDocenti } from "./TblAssocDocenti";
import { TblAssocStudenti } from "./TblAssocStudenti";

@Entity("tbl_corsi", { schema: "codingcontest2" })
export class TblCorsi {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "nome", length: 60 })
  nome: string;

  @Column("int", { name: "attivo", default: () => "'0'" })
  attivo: number;

  @Column("int", { name: "istituto" })
  istituto: number;

  @Column("text", { name: "info", nullable: true })
  info: string | null;

  @Column("int", { name: "iscrizione", default: () => "'1'" })
  iscrizione: number;

  @Column("int", { name: "req_matricola", default: () => "'1'" })
  reqMatricola: number;

  @Column("int", { name: "req_card", default: () => "'1'" })
  reqCard: number;

  @Column("int", { name: "esercitazione", default: () => "'0'" })
  esercitazione: number;

  @Column("int", { name: "vetrina", default: () => "'0'" })
  vetrina: number;

  @Column("int", { name: "riepilogo", default: () => "'0'" })
  riepilogo: number;

  @Column("int", { name: "exprog", default: () => "'0'" })
  exprog: number;

  @Column("int", { name: "exqst", default: () => "'0'" })
  exqst: number;

  @Column("varchar", {
    name: "ordine_esercizi",
    length: 20,
    default: () => "'livello'",
  })
  ordineEsercizi: string;

  @OneToMany(
    () => TblAssocDocenti,
    (tblAssocDocenti) => tblAssocDocenti.corso,
    {
      cascade: ["insert", "remove"],
    }
  )
  @JoinColumn({ name: "id", referencedColumnName: "id_corso" })
  assocDocenti: TblAssocDocenti[];

  @OneToMany(
    () => TblAssocStudenti,
    (TblAssocStudenti) => TblAssocStudenti.corso,
    {
      cascade: ["insert", "remove"],
    }
  )
  @JoinColumn({ name: "id", referencedColumnName: "id_corso" })
  assocStudenti: TblAssocDocenti[];
}
