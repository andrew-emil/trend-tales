import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Blog } from "src/blogs/entities/blog.entity";
import { Repository } from "typeorm";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { Comment } from "./entities/comment.entity";
import { UsersService } from "src/users/users.service";
import { BlogsService } from "src/blogs/blogs.service";

@Injectable()
export class CommentsService {
	constructor(
		@InjectRepository(Comment)
		private readonly commentRepo: Repository<Comment>,
		private readonly usersService: UsersService,
		private readonly blogsService: BlogsService
	) {}

	async createComment(createCommentDto: CreateCommentDto) {
		const [blog, user] = await Promise.all([
			this.blogsService.getBlogById(createCommentDto.blogId),
			this.usersService.findUserById(createCommentDto.userId),
		]);
		const comment = this.commentRepo.create({
			...createCommentDto,
			user,
			blog,
		});

		return await this.commentRepo.save(comment);
	}

	async findAllCommentsByBlog(blog: Blog) {
		const comments = await this.commentRepo.find({
			where: {
				blog,
			},
			relations: {
				user: true,
			},
		});

		return comments;
	}

	async removeComment(id: number, userId: number) {
		const comment = await this.commentRepo.findOne({
			where: { id },
			relations: {
				user: true,
			},
		});
		if (!comment) throw new NotFoundException("Comment not found");

		if (comment.user.id !== userId) throw new UnauthorizedException();

		const result = await this.commentRepo.delete({ id });
		if (result.affected === 0)
			throw new InternalServerErrorException(
				"something wrong happened while deleting comment"
			);

		return "comment deleted successfully";
	}
}
