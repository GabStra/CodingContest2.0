import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { TblAdmin } from "./TblAdmin";
import { TblAssocDocenti } from "./TblAssocDocenti";
import { TblAssocStudenti } from "./TblAssocStudenti";

@Index("userEmail", ["userEmail"], { unique: true })
@Entity("tbl_users", { schema: "codingcontest2" })
export class TblUsers {
  @PrimaryGeneratedColumn({ type: "int", name: "ID" })
  id: number;

  @Column("varchar", { name: "userID", length: 20 })
  userId: string;

  @Column("varchar", { name: "userName", length: 100 })
  userName: string;

  @Column("varchar", { name: "userEmail", unique: true, length: 100 })
  userEmail: string;

  @Column("varchar", { name: "userPass", length: 100 })
  userPass: string;

  @Column("enum", {
    name: "userStatus",
    enum: ["Y", "N"],
    default: () => "'N'",
  })
  userStatus: "Y" | "N";

  @Column("varchar", { name: "tokenCode", length: 100 })
  tokenCode: string;

  @Column("varchar", { name: "avatar", length: 20, default: () => "'users-1'" })
  avatar: string;

  @Column("varchar", { name: "newmail", nullable: true, length: 100 })
  newmail: string | null;

  @OneToOne(() => TblAdmin, (admin) => admin.userId)
  @JoinColumn({ name: "userID" })
  admin: TblAdmin;

  @OneToMany(() => TblAssocDocenti, (tblAssocDocenti) => tblAssocDocenti.user, {
    cascade: ["remove"],
  })
  @JoinColumn({ name: "id", referencedColumnName: "id_utente" })
  assocDocenti: TblAssocDocenti[];

  @OneToMany(
    () => TblAssocStudenti,
    (TblAssocStudenti) => TblAssocStudenti.user,
    {
      cascade: ["remove"],
    }
  )
  @JoinColumn({ name: "userId", referencedColumnName: "id_utente" })
  assocStudenti: TblAssocStudenti[];
}
