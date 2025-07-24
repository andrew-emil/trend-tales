import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	UnauthorizedException,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
	ApiUnauthorizedResponse,
	getSchemaPath,
} from "@nestjs/swagger";
import { ActiveUser } from "src/auth/decorators/active-user.decorator";
import { Auth } from "src/auth/decorators/auth.decorator";
import { AuthType } from "src/auth/enums/authType.enum";
import { UserPayload } from "src/auth/interfaces/user.interface";
import { PaginationDto } from "src/common/pagination/dtos/pagination.dto";
import { BlogsService } from "./blogs.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { Blog } from "./entities/blog.entity";
import { SearchBlogDto } from "./dto/search-blog.dto";

@ApiTags("Blogs")
@Controller("blogs")
@Auth(AuthType.BEARER)
@ApiBearerAuth()
export class BlogsController {
	constructor(private readonly blogsService: BlogsService) {}

	@Post()
	@UseInterceptors(FileInterceptor("thumbnail"))
	@ApiOperation({ summary: "Create a new blog post" })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: "The blog post has been successfully created.",
		type: CreateBlogDto,
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: "A blog with this title already exists.",
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: "Unauthorized access.",
	})
	@ApiBody({
		type: CreateBlogDto,
		description: "Data for creating a new blog post",
	})
	@ApiConsumes("multipart/form-data")
	async create(
		@Body() createBlogDto: CreateBlogDto,
		@UploadedFile() thumbnail: Express.Multer.File,
		@ActiveUser() user: UserPayload
	) {
		createBlogDto.thumbnail = thumbnail.buffer;
		return this.blogsService.createBlog(createBlogDto, user.sub);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get a blog post by ID" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "The blog post details.",
		type: Blog,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Blog not found.",
	})
	async findOne(@Param("id") blogId: string) {
		return this.blogsService.getBlogById(+blogId);
	}

	@Patch(":id")
	@UseInterceptors(FileInterceptor("thumbnail"))
	@ApiOperation({ summary: "Update an existing blog post or add a like" })
	@ApiQuery({
		name: "addLike",
		type: Boolean,
		required: false,
		description:
			"Set to true to increment the like count of the blog post. Defaults to false.",
		example: false,
	})
	@ApiResponse({
		status: HttpStatus.OK,
		description: "The blog post has been successfully updated.",
		type: UpdateBlogDto,
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Blog not found.",
	})
	@ApiResponse({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		description: "Something went wrong! Could not update blog.",
	})
	@ApiBody({
		type: UpdateBlogDto,
		description: "Data for updating the blog post",
	})
	@ApiConsumes("multipart/form-data")
	async update(
		@Param("id") blogId: string,
		@Body() updateBlogDto: UpdateBlogDto,
		@UploadedFile() thumbnail: Express.Multer.File,
		@Query("addLike") addLike?: string
	) {
		const shouldAddLike = addLike === "true";
		updateBlogDto.thumbnail = thumbnail.buffer;
		return this.blogsService.updateBlog(+blogId, updateBlogDto, shouldAddLike);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a blog post by ID (only by the owner)" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "Blog Deleted successfully.",
	})
	@ApiResponse({
		status: HttpStatus.NOT_FOUND,
		description: "Blog not found.",
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: "Unauthorized to delete this blog post.",
	})
	@ApiResponse({
		status: HttpStatus.INTERNAL_SERVER_ERROR,
		description: "Something went wrong! Could not delete blog.",
	})
	async remove(@Param("id") blogId: string, @ActiveUser() user: UserPayload) {
		return this.blogsService.deleteBlog(+blogId, user.sub);
	}

	@Get()
	@Auth(AuthType.NONE)
	@ApiOperation({ summary: "List all blogs with pagination" })
	@ApiQuery({
		name: "limit",
		required: false,
		type: Number,
		description: "Number of items per page",
		example: 10,
	})
	@ApiQuery({
		name: "page",
		required: false,
		type: Number,
		description: "Page number (1‑based)",
		example: 1,
	})
	@ApiOkResponse({
		description: "Paginated list of blogs",
		schema: {
			properties: {
				links: { type: "object" },
				meta: { type: "object" },
				data: {
					type: "array",
					items: { $ref: getSchemaPath(Blog) },
				},
			},
		},
	})
	async getAllBlogs(@Query() query: PaginationDto) {
		return this.blogsService.getAllBlogs(query);
	}

	@Get("user/:userId")
	@ApiBearerAuth()
	@ApiOperation({ summary: "List blogs belonging to the current user" })
	@ApiParam({
		name: "userId",
		type: Number,
		description: "ID of the user making the request",
		example: 42,
	})
	@ApiOkResponse({
		description: "Array of the user's blogs",
		schema: {
			type: "array",
			items: { $ref: getSchemaPath(Blog) },
		},
	})
	@ApiUnauthorizedResponse({
		description: "User tried to fetch another user's blogs",
	})
	async getBlogsByUserId(
		@Param("userId") userId: string,
		@ActiveUser() user: UserPayload
	) {
		if (parseInt(userId, 10) !== user.sub) {
			throw new UnauthorizedException("You can only list your own blogs");
		}
		return this.blogsService.getUserBlogs(user.sub);
	}

	@Get("/search")
	async searchBlog(@Query() dto: SearchBlogDto) {
		return this.blogsService.searchBlog(dto);
	}
}
