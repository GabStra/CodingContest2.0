import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tbl_quesiti", { schema: "codingcontest2" })
export class TblQuesiti {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "categoria", length: 20, default: () => "''" })
  categoria: string;

  @Column("text", { name: "domanda" })
  domanda: string;

  @Column("text", { name: "esatte" })
  esatte: string;

  @Column("text", { name: "sbagliate" })
  sbagliate: string;

  @Column("int", { name: "risposte", default: () => "'0'" })
  risposte: number;

  @Column("varchar", { name: "tipologia", length: 20, default: () => "''" })
  tipologia: string;

  @Column("tinyint", {
    name: "in_esercitazione",
    width: 1,
    default: () => "'1'",
  })
  inEsercitazione: boolean;

  @Column("varchar", { name: "pagina_libro", nullable: true, length: 100 })
  paginaLibro: string | null;

  @Column("int", { name: "tempo", nullable: true })
  tempo: number | null;
}
