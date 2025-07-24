import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateCommentDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    userId: number
    
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    blogId: number

    @IsNotEmpty()
    @IsString()
    message: string
}
