import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tbl_tags", { schema: "codingcontest2" })
export class TblTags {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "tag", length: 30 })
  tag: string;
}
