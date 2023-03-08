import { Column, Entity } from "typeorm";

@Entity("tbl_prenotazioni", { schema: "codingcontest2" })
export class TblPrenotazioni {
  @Column("int", { primary: true, name: "id_utente" })
  idUtente: number;

  @Column("int", { primary: true, name: "id_appello" })
  idAppello: number;

  @Column("varchar", { name: "code", nullable: true, length: 20 })
  code: string | null;

  @Column("int", { name: "punteggio", default: () => "'0'" })
  punteggio: number;

  @Column("varchar", { name: "time", nullable: true, length: 30 })
  time: string | null;

  @Column("varchar", { name: "ipaddress", nullable: true, length: 20 })
  ipaddress: string | null;
}
