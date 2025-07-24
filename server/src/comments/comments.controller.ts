import { Body, Controller, Delete, Param, Post, UnauthorizedException } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { Auth } from "src/auth/decorators/auth.decorator";
import { AuthType } from "src/auth/enums/authType.enum";
import { Comment } from "./entities/comment.entity";
import {
	ApiTags,
	ApiBearerAuth,
	ApiOperation,
	ApiCreatedResponse,
	ApiBadRequestResponse,
	ApiUnauthorizedResponse,
	ApiParam,
	ApiOkResponse,
	ApiNotFoundResponse,
	ApiInternalServerErrorResponse,
	ApiBody,
} from "@nestjs/swagger";
import { ActiveUser } from "src/auth/decorators/active-user.decorator";
import { UserPayload } from "src/auth/interfaces/user.interface";

@ApiTags("Comments")
@ApiBearerAuth()
@Controller("comments")
@Auth(AuthType.BEARER)
export class CommentsController {
	constructor(private readonly commentsService: CommentsService) {}

	@Post()
	@ApiOperation({ summary: "Create a new comment" })
	@ApiBody({ type: CreateCommentDto })
	@ApiCreatedResponse({
		description: "The comment has been successfully created",
		type: Comment,
	})
	@ApiBadRequestResponse({ description: "Invalid request payload" })
	@ApiUnauthorizedResponse({ description: "Missing or invalid auth token" })
	create(
		@Body() createCommentDto: CreateCommentDto,
		@ActiveUser() user: UserPayload
	) {
		if(user.sub !== createCommentDto.userId)
			throw new UnauthorizedException()
		return this.commentsService.createComment(createCommentDto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete a comment by its ID" })
	@ApiParam({
		name: "id",
		type: Number,
		description: "ID of the comment to delete",
		example: 123,
	})
	@ApiOkResponse({
		description: "Comment deleted successfully",
		schema: { example: "comment deleted successfully" },
	})
	@ApiNotFoundResponse({ description: "Comment not found" })
	@ApiInternalServerErrorResponse({
		description: "Error occurred while deleting the comment",
	})
	@ApiUnauthorizedResponse({ description: "Missing or invalid auth token" })
	remove(@Param("id") id: string, @ActiveUser() user: UserPayload) {
		return this.commentsService.removeComment(+id, user.sub);
	}
}
