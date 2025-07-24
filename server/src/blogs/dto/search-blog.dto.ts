import { IsString } from "class-validator";
import { PaginationDto } from "src/common/pagination/dtos/pagination.dto";

export class SearchBlogDto extends PaginationDto {
	@IsString()
	searchTerm: string;
}
