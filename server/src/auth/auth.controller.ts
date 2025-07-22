import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { AuthService } from "./auth.service";
import { Auth } from "./decorators/auth.decorator";
import { GoogleTokenDto } from "./dtos/googleToken.dto";
import { LoginDto } from "./dtos/login.dto";
import { AuthType } from "./enums/authType.enum";
import { ResetPasswordDto } from "./dtos/reset-password.dto";

@Controller("auth")
@Auth(AuthType.NONE)
@ApiTags("Authentication")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Login with email and password" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User successfully logged in",
		schema: {
			properties: {
				accessToken: {
					type: "string",
					description: "JWT access token",
					example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
				},
				user: {
					type: "object",
					properties: {
						id: {
							type: "string",
							example: "123e4567-e89b-12d3-a456-426614174000",
						},
						email: { type: "string", example: "john.doe@example.com" },
					},
				},
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: "Invalid credentials",
	})
	public async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@Post("google")
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: "Login with Google OAuth token" })
	@ApiResponse({
		status: HttpStatus.OK,
		description: "User successfully logged in with Google",
		schema: {
			properties: {
				accessToken: {
					type: "string",
					description: "JWT access token",
					example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
				},
				user: {
					type: "object",
					properties: {
						id: {
							type: "string",
							example: "123e4567-e89b-12d3-a456-426614174000",
						},
						email: { type: "string", example: "john.doe@example.com" },
					},
				},
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.UNAUTHORIZED,
		description: "Invalid Google token",
	})
	public async googleLogin(@Body() token: GoogleTokenDto) {
		return this.authService.googleLogin(token);
	}

	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@ApiOperation({ summary: "Register a new user" })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: "User successfully registered",
		schema: {
			properties: {
				accessToken: {
					type: "string",
					description: "JWT access token",
					example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
				},
				user: {
					type: "object",
					properties: {
						id: {
							type: "string",
							example: "123e4567-e89b-12d3-a456-426614174000",
						},
						email: { type: "string", example: "john.doe@example.com" },
					},
				},
			},
		},
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: "Invalid registration data",
	})
	@ApiResponse({
		status: HttpStatus.CONFLICT,
		description: "Email already exists",
	})
	public async register(@Body() createUserDto: CreateUserDto) {
		return this.authService.register(createUserDto);
	}

	@Post("/reset-password")
	@ApiOperation({ summary: "Reset user password" })
	@ApiResponse({
		status: 200,
		description: "Password successfully reset.",
		type: Object,
	})
	@ApiResponse({ status: 404, description: "User not found." })
	@ApiResponse({
		status: 400,
		description: "Invalid password or other validation error.",
	})
	@ApiBody({
		type: ResetPasswordDto,
		description: "Payload for resetting password",
	})
	public async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
		return this.authService.resetPassword(
			resetPasswordDto.password,
			resetPasswordDto.email
		);
	}

	@Post("/forget-password")
	@ApiOperation({ summary: "Request a password reset email" })
	@ApiResponse({
		status: 200,
		description: "Password reset email sent successfully.",
	})
	@ApiResponse({ status: 404, description: "User not found." })
	@ApiBody({
		schema: {
			type: "string",
			example: "user@example.com",
			description: "The email address of the user who forgot their password",
		},
		description: "Email address to send the password reset link to",
	})
	public async forgetPassword(@Body() email: string) {
		return this.authService.forgetPassword(email);
	}
}
