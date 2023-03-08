import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tbl_appelli", { schema: "codingcontest2" })
export class TblAppelli {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "id_corso" })
  idCorso: number;

  @Column("varchar", { name: "denominazione", nullable: true, length: 100 })
  denominazione: string | null;

  @Column("int", { name: "anno" })
  anno: number;

  @Column("int", { name: "mese" })
  mese: number;

  @Column("int", { name: "giorno" })
  giorno: number;

  @Column("varchar", { name: "ora", length: 10 })
  ora: string;

  @Column("varchar", { name: "chiusura", nullable: true, length: 10 })
  chiusura: string | null;

  @Column("int", { name: "prenotazione", default: () => "'1'" })
  prenotazione: number;

  @Column("int", { name: "scadenza_anno" })
  scadenzaAnno: number;

  @Column("int", { name: "scadenza_mese" })
  scadenzaMese: number;

  @Column("int", { name: "scadenza_giorno" })
  scadenzaGiorno: number;

  @Column("varchar", { name: "luogo", length: 100, default: () => "'da def.'" })
  luogo: string;

  @Column("text", { name: "info", nullable: true })
  info: string | null;

  @Column("text", { name: "ipaddress", nullable: true })
  ipaddress: string | null;
}
