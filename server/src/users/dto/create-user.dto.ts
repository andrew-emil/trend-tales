import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
	@ApiProperty({
		description: "The full name of the user",
		example: "John Doe",
		minLength: 1,
	})
	@IsNotEmpty()
	@IsString()
	fullName: string;

	@ApiProperty({
		description: "The email address of the user (must be unique)",
		example: "john.doe@example.com",
		format: "email",
	})
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({
		description: "The password for the user (will be hashed)",
		example: "SecurePass123!",
		minLength: 6,
	})
	@IsOptional()
	@IsString()
	@MinLength(6, { message: "Password must be at least 6 characters long" })
	password?: string;

	@ApiProperty({
		description: "Optional Google ID if the user registered via Google",
		example: "1234567890abcdef",
		required: false,
	})
	@IsOptional()
	@IsString()
	google_id?: string;
}
