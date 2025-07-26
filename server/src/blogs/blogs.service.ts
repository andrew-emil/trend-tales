import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "src/common/pagination/dtos/pagination.dto";
import { PaginationService } from "src/common/pagination/pagination.service";
import { UsersService } from "src/users/users.service";
import { Brackets, Repository } from "typeorm";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { SearchBlogDto } from "./dto/search-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { Blog } from "./entities/blog.entity";

@Injectable()
export class BlogsService {
	constructor(
		@InjectRepository(Blog)
		private blogRepo: Repository<Blog>,
		private readonly usersService: UsersService,
		private readonly paginationService: PaginationService
	) {}

	async createBlog(createBlogDto: CreateBlogDto, userId: number) {
		const existingBlog = await this.blogRepo.findOneBy({
			title: createBlogDto.title,
		});
		if (existingBlog) throw new ConflictException("This Blog does exist!");

		const user = await this.usersService.findUserById(userId);

		const newBlog = this.blogRepo.create({
			...createBlogDto,
			user,
		});

		return await this.blogRepo.save(newBlog);
	}

	async getBlogById(blogId: number) {
		const blog = await this.blogRepo.findOne({
			where: { id: blogId },
			relations: ["user", "comment"],
		});
		if (!blog) throw new NotFoundException("Blog not found");

		return blog;
	}

	async updateBlog(
		blogId: number,
		updateBlogDto: UpdateBlogDto,
		addLike: boolean
	) {
		const blog = await this.blogRepo.findOneBy({ id: blogId });
		if (!blog) throw new NotFoundException("Blog not found");

		const updateData: Partial<Blog> = {
			title: updateBlogDto.title,
			body: updateBlogDto.body,
			tags: updateBlogDto.tags,
			likes: addLike ? ++blog.likes : blog.likes,
		};

		if (
			updateBlogDto.thumbnail !== undefined &&
			typeof updateBlogDto.thumbnail === "string"
		) {
			updateData.thumbnail = Buffer.from(updateBlogDto.thumbnail, "base64");
		}

		const result = await this.blogRepo.update({ id: blogId }, updateData);
		if (result.affected === 0)
			throw new InternalServerErrorException(
				"Something went wrong! couldn't update Blog"
			);

		return await this.blogRepo.findOneBy({ id: blogId });
	}

	async deleteBlog(blogId: number, userId: number) {
		const blog = await this.blogRepo.findOne({
			where: { id: blogId },
			relations: ["user"],
		});
		if (!blog) throw new NotFoundException("Blog not found");

		if (blog.user.id !== userId) throw new UnauthorizedException();

		const result = await this.blogRepo.delete({ id: blogId });
		if (result.affected === 0)
			throw new InternalServerErrorException(
				"Something went wrong! couldn't delete Blog"
			);

		return "Blog Deleted successfully";
	}

	async getAllBlogs(query: PaginationDto) {
		const result = await this.paginationService.paginate<Blog>(
			this.blogRepo,
			query,
			undefined,
			{ created_at: "DESC" },
			{ comment: true, user: true },
			{
				id: true,
				title: true,
				thumbnail: true,
				created_at: true,
				tags: true,
				likes: true,
				comment: true,
				user: true,
			}
		);

		return result;
	}

	async getUserBlogs(userId: number) {
		const user = await this.usersService.findUserById(userId);

		const blogs = await this.blogRepo.find({
			where: {
				user,
			},
			relations: ["user"],
			select: {
				id: true,
				title: true,
				thumbnail: true,
				tags: true,
				created_at: true,
				updated_at: true,
			},
		});

		return blogs;
	}

	async searchBlog(searchBlogDto: SearchBlogDto) {
		const { searchTerm, page = 1, limit = 10 } = searchBlogDto;
		const skip = (page - 1) * limit;

		const queryBuilder = this.blogRepo.createQueryBuilder("blog");
		const likeTerm = `%${searchTerm}%`;

		queryBuilder.where(
			new Brackets((qb) => {
				qb.where("blog.title ILIKE :likeTerm", { likeTerm });
				qb.orWhere("array_to_string(blog.tags, ', ') ILIKE :likeTerm", {
					likeTerm,
				});
			})
		);

		queryBuilder.orderBy("blog.created_at", "DESC");
		queryBuilder.skip(skip).take(limit);
		const result = await queryBuilder.getMany();
		return result;
	}
}
