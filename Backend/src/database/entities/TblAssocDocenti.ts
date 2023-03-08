import { Column, Entity } from "typeorm";

@Entity("tbl_assoc_docenti", { schema: "codingcontest2" })
export class TblAssocDocenti {
  @Column("int", { primary: true, name: "id_corso" })
  idCorso: number;

  @Column("int", { primary: true, name: "id_utente" })
  idUtente: number;
}
