import { PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class UpdateUserDto extends PartialType(CreateUserDto) {
	@IsNotEmpty()
	@IsNumber()
	@IsPositive()
	id: number;
}
