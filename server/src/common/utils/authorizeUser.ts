import { ForbiddenException } from "@nestjs/common";
import { JwtPayload } from "src/auth/interfaces/jwt-payload";
import { UserRole } from "src/users/enums/userRole.enum";

export function authorizeUser(user: JwtPayload) {
	if (user.role !== UserRole.ADMIN) {
		throw new ForbiddenException(
			"You are not authorized to access this resource"
		);
	}
}
