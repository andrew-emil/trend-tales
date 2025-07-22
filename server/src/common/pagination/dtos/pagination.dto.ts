import { ApiPropertyOptional } from "@nestjs/swagger";
import {
	IsOptional,
	IsPositive
} from "class-validator";

export class PaginationDto {
	@ApiPropertyOptional({
		description: "Number of items per page",
		minimum: 1,
		default: 10,
		example: 10,
	})
	@IsOptional()
	@IsPositive()
	limit?: number = 10;

	@ApiPropertyOptional({
		description: "Page number",
		minimum: 1,
		default: 1,
		example: 1,
	})
	@IsOptional()
	@IsPositive()
	page?: number = 1;
}
