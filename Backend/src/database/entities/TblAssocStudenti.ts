import { Column, Entity } from "typeorm";

@Entity("tbl_assoc_studenti", { schema: "codingcontest2" })
export class TblAssocStudenti {
  @Column("int", { primary: true, name: "id_corso" })
  idCorso: number;

  @Column("varchar", { primary: true, name: "id_utente", length: 30 })
  idUtente: string;

  @Column("int", { name: "attivo", default: () => "'1'" })
  attivo: number;

  @Column("varchar", { name: "matricola", nullable: true, length: 20 })
  matricola: string | null;

  @Column("varchar", { name: "card", nullable: true, length: 20 })
  card: string | null;
}
