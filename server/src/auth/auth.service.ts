import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
	OnModuleInit,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { OAuth2Client } from "google-auth-library";
import jwtConfig from "src/config/jwt.config";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersService } from "src/users/users.service";
import { GoogleTokenDto } from "./dtos/googleToken.dto";
import { LoginDto } from "./dtos/login.dto";
import { BcryptProvider } from "./providers/bcrypt.provider";
import { GenerateTokenProvider } from "./providers/generate-token.provider";
import { MailsService } from "src/mails/mails.service";

@Injectable()
export class AuthService implements OnModuleInit {
	private oAuthClient: OAuth2Client;
	constructor(
		@Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,
		private readonly bcryptProvider: BcryptProvider,
		private readonly generateTokenProvider: GenerateTokenProvider,
		@Inject(jwtConfig.KEY)
		private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
		private readonly mailsService: MailsService
	) {}
	onModuleInit() {
		this.oAuthClient = new OAuth2Client(
			this.jwtConfiguration.googleClientId,
			this.jwtConfiguration.googleClientSecret
		);
	}

	public async login(loginDto: LoginDto) {
		const user = await this.usersService.findUserByEmail(loginDto.email);

		if (!user) throw new NotFoundException("User not found");

		const isPasswordValid = await this.bcryptProvider.comparePassword(
			loginDto.password,
			user.password_hash ?? ""
		);

		if (!isPasswordValid)
			throw new BadRequestException("Invalid Email or password");

		const accessToken = await this.generateTokenProvider.generateAccessToken(
			user.id,
			user.email,
			user.fullName
		);

		return {
			accessToken,
		};
	}

	public async googleLogin(googleTokenDto: GoogleTokenDto) {
		const loginTicket = await this.oAuthClient.verifyIdToken({
			idToken: googleTokenDto.token,
		});
		const payload = loginTicket.getPayload();
		if (!payload) throw new BadRequestException("Invalid Google Token");

		const {
			email,
			sub: googleId,
			given_name: firstName,
			family_name: lastName,
		} = payload;

		const user = await this.usersService.findUserByGoogleId(googleId);

		if (user) {
			return {
				accessToken: await this.generateTokenProvider.generateAccessToken(
					user.id,
					user.email,
					user.fullName
				),
			};
		}
		try {
			const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
			const dto = {
				email: email ?? "",
				fullName,
				google_id: googleTokenDto.token,
			} as CreateUserDto;
			const newUser = await this.usersService.createUser(dto);
			return {
				accessToken: await this.generateTokenProvider.generateAccessToken(
					newUser.id,
					newUser.email,
					newUser.fullName
				),
			};
		} catch (err) {
			throw new UnauthorizedException(err, {
				description: "Could not create user with google",
			});
		}
	}

	public async register(createUserDto: CreateUserDto) {
		const user = await this.usersService.createUser(createUserDto);

		await this.mailsService.sendWelcomeEmail(user);

		return await this.generateTokenProvider.generateAccessToken(
			user.id,
			user.email,
			user.fullName
		);
	}

	public async forgetPassword(email: string) {
		const user = await this.usersService.findUserByEmail(email);
		if (!user) throw new NotFoundException("User Not found");

		await this.mailsService.sendResetPasswordEmail(email, user.fullName);

		return "We have sent you an email for reset the password";
	}

	public async resetPassword(password: string, email: string) {
		if (password.trim() === "")
			throw new BadRequestException("Invalid password");

		const user = await this.usersService.findUserByEmail(email);
		if (!user) throw new NotFoundException("User Not found");

		const updatedUser = await this.usersService.updateUser({
			id: user.id,
			password,
		});

		return updatedUser;
	}
}
