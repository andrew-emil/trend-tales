import {
	IsArray,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBlogDto {
	@ApiProperty({
		description: "The title of the blog post",
		maxLength: 50,
		example: "My First Blog Post",
	})
	@IsNotEmpty()
	@IsString()
	@MaxLength(50)
	title: string;

	@ApiProperty({
		description: "The main content or body of the blog post",
		minLength: 50,
		example:
			"This is a very detailed and informative blog post about various interesting topics. It covers a wide range of subjects...",
	})
	@IsNotEmpty()
	@IsString()
	@MinLength(50, { message: "Body must be at least 50 characters long" })
	body: string;

	@ApiProperty({
		description:
			"Optional thumbnail image for the blog post, sent as a Base64 encoded string.",
		required: false,
		type: Buffer,
	})
	@IsOptional()
	thumbnail?: Buffer;

	@ApiProperty({
		description: "An array of tags associated with the blog post.",
		type: [String],
		minItems: 1,
		example: ["NestJS", "TypeScript", "Backend", "WebDev"],
	})
	@IsNotEmpty()
	@IsArray()
	@IsString({ each: true })
	@MinLength(1, {
		each: true,
		message: "Each tag must be at least 1 character long",
	})
	tags: string[];
}
