import { Blog } from "src/blogs/entities/blog.entity";
import { User } from "src/users/entities/user.entity";
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Comment {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: "varchar" })
	message: string;

	@ManyToOne(() => User, (user) => user.comment)
	user: User;

	@ManyToOne(() => Blog, (blog) => blog.comment)
	blog: Blog;

	@CreateDateColumn()
	created_at: Date;
}
