import { Blog } from "src/blogs/entities/blog.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Comment } from "src/comments/entities/comment.entity";

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

	@OneToMany(() => Blog, (blog) => blog.user)
	blog: Blog;

	@OneToMany(() => Comment, (comment) => comment.user)
	comment: Comment;
}
