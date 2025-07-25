import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Comment } from "./entities/comment.entity";
import { BlogsModule } from "src/blogs/blogs.module";
import { UsersModule } from "src/users/users.module";

@Module({
	controllers: [CommentsController],
	providers: [CommentsService],
	imports: [TypeOrmModule.forFeature([Comment]), BlogsModule, UsersModule],
	exports: [CommentsService],
})
export class CommentsModule {}
