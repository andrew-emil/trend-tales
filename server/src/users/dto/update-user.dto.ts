import { PartialType, ApiProperty } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@ApiProperty({
		description: "The unique ID of the user to be updated",
		example: 1,
		minimum: 1,
	})
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	id: number;
}
