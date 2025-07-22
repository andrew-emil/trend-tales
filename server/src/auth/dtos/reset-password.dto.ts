import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
	@ApiProperty({
		description: "The new password for the user",
		example: "SecurePassword123!",
		minLength: 6, // Example minimum length
	})
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@ApiProperty({
		description: "The email address associated with the account",
		example: "user@example.com",
		format: "email",
	})
	@IsNotEmpty()
	@IsString()
	@MinLength(6, { message: "Password must be at least 6 characters long" })
	password: string;
}
