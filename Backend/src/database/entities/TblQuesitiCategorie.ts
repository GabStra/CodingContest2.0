import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tbl_quesiti_categorie", { schema: "codingcontest2" })
export class TblQuesitiCategorie {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "categoria", length: 100 })
  categoria: string;

  @Column("int", { name: "id_corso", nullable: true })
  idCorso: number | null;

  @Column("int", { name: "attivo", default: () => "'0'" })
  attivo: number;
}
