import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", length: 100 })
	fullName: string;

	@Column({ type: "varchar", length: 100, unique: true })
	email: string;

	@Column({ type: "varchar", nullable: true })
	password_hash?: string | null;

	@Column({ type: "varchar", nullable: true })
	google_id?: string | null;
}
