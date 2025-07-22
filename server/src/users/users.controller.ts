import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
} from "@nestjs/swagger";
import { User } from "./entities/user.entity";

@ApiTags("users")
@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get(":id")
	@ApiOperation({ summary: "Retrieve a single user by ID" })
	@ApiParam({
		name: "id",
		description: "The ID of the user",
		type: String,
		example: "1",
	})
	@ApiResponse({
		status: 200,
		description: "User found and returned successfully",
		type: User,
	})
	@ApiResponse({ status: 404, description: "User not found" })
	findOne(@Param("id") id: string) {
		return this.usersService.findUserById(+id);
	}

	@Patch(":id")
	@ApiOperation({ summary: "Update an existing user by ID" })
	@ApiParam({
		name: "id",
		description: "The ID of the user to update",
		type: String,
		example: "1",
	})
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
	update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
		return this.usersService.updateUser(updateUserDto);
	}

	@Delete(":id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiOperation({ summary: "Delete a user by ID" })
	@ApiParam({
		name: "id",
		description: "The ID of the user to delete",
		type: String,
		example: "1",
	})
	@ApiResponse({ status: 204, description: "No content" })
	@ApiResponse({ status: 404, description: "User not found" })
	remove(@Param("id") id: string) {
		return this.usersService.deleteUser(+id);
	}
}
