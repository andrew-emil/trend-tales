import { UserPayload } from "./user.interface";

export interface JwtPayload extends UserPayload {
	iat: number;
	exp: number;
	iss: string;
	aud: string;
}
