import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { TblTags } from "./TblTags";
import { TblSubmissions } from "./TblSubmissions";

@Entity("tbl_esercizi", { schema: "codingcontest2" })
export class TblEsercizi {
  @Column("int", { name: "id", nullable: true })
  id: number | null;

  @Column("varchar", { primary: true, name: "title", length: 50 })
  title: string;

  @Column("int", { primary: true, name: "id_corso", default: () => "'1'" })
  idCorso: number;

  @Column("int", { name: "id_categoria", nullable: true })
  idCategoria: number | null;

  @Column("int", { name: "level" })
  level: number;

  @Column("varchar", {
    name: "tags",
    length: 20,
    default: () => "'00000000000000000000'",
  })
  tags: string;

  @Column("varchar", { name: "path", length: 40 })
  path: string;

  @Column("int", { name: "maxscore", nullable: true, default: () => "'10'" })
  maxscore: number | null;

  @Column("int", { name: "task", nullable: true, default: () => "'100'" })
  task: number | null;

  @Column("varchar", { name: "titolo_esteso", nullable: true, length: 100 })
  titoloEsteso: string | null;

  @Column("text", { name: "introduzione", nullable: true })
  introduzione: string | null;

  @Column("text", { name: "specifiche", nullable: true })
  specifiche: string | null;

  @Column("text", { name: "input", nullable: true })
  input: string | null;

  @Column("text", { name: "output", nullable: true })
  output: string | null;

  @Column("text", { name: "note", nullable: true })
  note: string | null;

  @Column("text", { name: "esempio", nullable: true })
  esempio: string | null;

  @Column("tinyint", { name: "pronto", width: 1, default: () => "'0'" })
  pronto: boolean;

  @Column("tinyint", { name: "pubblicato", width: 1, default: () => "'0'" })
  pubblicato: boolean;

  @Column("varchar", { name: "autore", length: 30 })
  autore: string;

  @Column("text", { name: "taglist", nullable: true })
  taglist: string | null;

  @Column("varchar", { name: "tempo_inizio", nullable: true, length: 30 })
  tempoInizio: string | null;

  @Column("varchar", { name: "tempo_fine", nullable: true, length: 30 })
  tempoFine: string | null;

  @Column("int", { name: "durata", nullable: true })
  durata: number | null;

  @Column("int", { name: "codice", default: () => "'0'" })
  codice: number;

  @Column("int", { name: "max_sottomissioni", default: () => "'0'" })
  maxSottomissioni: number;

  @Column("int", { name: "gara", default: () => "'0'" })
  gara: number;

  @Column("varchar", { name: "punti_gara", length: 2, default: () => "'0'" })
  puntiGara: string;

  @Column("varchar", { name: "prop", length: 40, default: () => "'0'" })
  prop: string;

  @OneToOne(() => TblTags)
  @JoinColumn({ name: "id_categoria", referencedColumnName: "id" })
  tag: TblTags;
}
