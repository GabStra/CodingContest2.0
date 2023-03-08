import { Column, Entity } from "typeorm";

@Entity("tbl_quesiti_prove_esecuzione", { schema: "codingcontest2" })
export class TblQuesitiProveEsecuzione {
  @Column("int", { primary: true, name: "id_prova" })
  idProva: number;

  @Column("int", { primary: true, name: "id_utente" })
  idUtente: number;

  @Column("varchar", { name: "ipaddress", nullable: true, length: 20 })
  ipaddress: string | null;

  @Column("varchar", { name: "inizio", nullable: true, length: 20 })
  inizio: string | null;

  @Column("varchar", { name: "fine", nullable: true, length: 20 })
  fine: string | null;

  @Column("int", { name: "punteggio", default: () => "'0'" })
  punteggio: number;

  @Column("text", { name: "quesiti" })
  quesiti: string;

  @Column("text", { name: "risposte", nullable: true })
  risposte: string | null;

  @Column("text", { name: "tempi_inizio", nullable: true })
  tempiInizio: string | null;
}
