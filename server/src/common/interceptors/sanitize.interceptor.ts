import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
	private static readonly SENSITIVE_FIELDS = ["password_hash", "google_id"];

	intercept(
		context: ExecutionContext,
		next: CallHandler<any>
	): Observable<any> | Promise<Observable<any>> {
		 return next.handle().pipe(map((data) => this.strip(data)));
	}

	private strip(input: any) {
		if (Array.isArray(input)) {
			return input.map((item) => this.strip(item));
		}

		if (input !== null && typeof input === "object") {
			const clone = { ...input };

			for (const field of SanitizeInterceptor.SENSITIVE_FIELDS) {
				if (field in clone) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					delete clone[field];
				}
			}

			for (const key of Object.keys(clone)) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				clone[key] = this.strip(clone[key]);
			}
			return clone;
		}

		// Primitives (string, number, etc.) just pass through
		return input;
	}
}
