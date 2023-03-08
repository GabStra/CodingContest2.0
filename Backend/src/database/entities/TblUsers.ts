import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

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
}
