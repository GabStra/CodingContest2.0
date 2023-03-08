import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tbl_quesiti_prove_gruppi", { schema: "codingcontest2" })
export class TblQuesitiProveGruppi {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "id_prova" })
  idProva: number;

  @Column("int", { name: "id_categoria", nullable: true })
  idCategoria: number | null;

  @Column("int", { name: "numero", nullable: true })
  numero: number | null;
}
