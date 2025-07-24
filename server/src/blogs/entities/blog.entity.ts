import { User } from "src/users/entities/user.entity";
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Comment } from "src/comments/entities/comment.entity";

@Entity()
export class Blog {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar", length: 50, unique: true })
	title: string;

	@Column({ type: "text" })
	body: string;

	@Column({ type: "bytea", nullable: true })
	thumbnail: Buffer;

	@Column("text", { array: true })
	tags: string[];
	
	@Column({ type: "int", default: 0 })
	likes: number;

	@ManyToOne(() => User, (user) => user.blog)
	user: User;

	@OneToMany(() => Comment, (comment) => comment.blog)
	comment: Comment

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}
