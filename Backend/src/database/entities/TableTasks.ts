import { Column, Entity } from "typeorm";

@Entity("table_tasks", { schema: "codingcontest2" })
export class TableTasks {
  @Column("varchar", { primary: true, name: "title", length: 50 })
  title: string;

  @Column("longtext", { name: "task_input" })
  taskInput: string;

  @Column("longtext", { name: "task_output" })
  taskOutput: string;
}
