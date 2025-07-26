import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Patch
} from "@nestjs/common";
import {
	ApiBody,
	ApiOperation,
	ApiResponse,
	ApiTags
} from "@nestjs/swagger";
import { ActiveUser } from "src/auth/decorators/active-user.decorator";
import { Auth } from "src/auth/decorators/auth.decorator";
import { AuthType } from "src/auth/enums/authType.enum";
import { UserPayload } from "src/auth/interfaces/user.interface";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
@Auth(AuthType.BEARER)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@ApiOperation({ summary: "Retrieve a single user by ID" })
	@ApiResponse({
		status: 200,
		description: "User found and returned successfully",
		type: User,
	})
	@ApiResponse({ status: 404, description: "User not found" })
	findOne(@ActiveUser() user: UserPayload) {
		return this.usersService.findUserById(user.sub);
	}

	@Patch()
	@ApiOperation({ summary: "Update an existing user by ID" })
	@ApiBody({ type: UpdateUserDto, description: "Partial user data to update" })
	@ApiResponse({
		status: 200,
		description: "User updated successfully",
		type: User,
	})
	@ApiResponse({ status: 404, description: "User not found" })
	@ApiResponse({
		status: 400,
		description: "Invalid input or validation error",
	})
	update(
		@ActiveUser() user: UserPayload,
		@Body() updateUserDto: UpdateUserDto
	) {
		return this.usersService.updateUser(user.sub, updateUserDto);
	}

	@Delete()
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete a user by ID" })
	@ApiResponse({ status: 204, description: "No content" })
	@ApiResponse({ status: 404, description: "User not found" })
	remove(@ActiveUser() user: UserPayload) {
		return this.usersService.deleteUser(user.sub);
	}
}
