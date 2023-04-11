import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { TblAdmin } from "./TblAdmin";
import { TblCorsi } from "./TblCorsi";
import { TblUsers } from "./TblUsers";

@Entity("tbl_assoc_docenti", { schema: "codingcontest2" })
export class TblAssocDocenti {
  @Column("int", { primary: true, name: "id_corso" })
  idCorso: number;

  @Column("int", { primary: true, name: "id_utente" })
  idUtente: number;

  @ManyToOne(() => TblCorsi, (TblCorsi) => TblCorsi.assocDocenti)
  @JoinColumn({ name: "id_corso", referencedColumnName: "id" })
  corso: TblCorsi;

  @ManyToOne(() => TblUsers, (TblUsers) => TblUsers.assocDocenti)
  @JoinColumn({ name: "id_utente", referencedColumnName: "id" })
  user: TblUsers;
}
