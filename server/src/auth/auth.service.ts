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

@Injectable()
export class AuthService implements OnModuleInit {
	private oAuthClient: OAuth2Client;
	constructor(
		@Inject(forwardRef(() => UsersService))
		private readonly usersService: UsersService,
		private readonly bcryptProvider: BcryptProvider,
		private readonly generateTokenProvider: GenerateTokenProvider,
		@Inject(jwtConfig.KEY)
		private readonly jwtConfiguration: ConfigType<typeof jwtConfig>
	) {}
	onModuleInit() {
		this.oAuthClient = new OAuth2Client(
			this.jwtConfiguration.googleClientId,
			this.jwtConfiguration.googleClientSecret
		);
	}

	public async login(loginDto: LoginDto) {
		const user = await this.usersService.findUserByEmail(loginDto.email)

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
			const newUser = await this.usersService.createUser({
				email: email ?? "",
				fullName,
				password: Math.random().toString(36).slice(-8),
				google_id: googleId,
			});
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

		return await this.generateTokenProvider.generateAccessToken(
			user.id,
			user.email,
			user.fullName
		);
	}
}
