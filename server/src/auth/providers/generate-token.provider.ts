import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import jwtConfig from "src/config/jwt.config";

@Injectable()
export class GenerateTokenProvider {
	constructor(
		private readonly jwtService: JwtService,
		@Inject(jwtConfig.KEY)
		private jwtConfiguration: ConfigType<typeof jwtConfig>
	) {}

	private async signToken<T>(userId: number, expiresIn: number, payload?: T) {
		return await this.jwtService.signAsync(
			{
				sub: userId,
				...payload,
			},
			{
				secret: this.jwtConfiguration.secret,
				audience: this.jwtConfiguration.audience,
				issuer: this.jwtConfiguration.issuer,
				expiresIn,
			}
		);
	}

	public async generateAccessToken(
		userId: number,
		email: string,
		fullName: string
	) {
		const accessToken = await this.signToken(
			userId,
			this.jwtConfiguration.expiresIn,
			{ email, fullName }
		);

		return accessToken;
	}
}
