import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaginationModule } from "src/common/pagination/pagination.module";
import { UsersModule } from "src/users/users.module";
import { BlogsController } from "./blogs.controller";
import { BlogsService } from "./blogs.service";
import { Blog } from "./entities/blog.entity";

@Module({
	controllers: [BlogsController],
	providers: [BlogsService],
	imports: [
		UsersModule,
		PaginationModule,
		TypeOrmModule.forFeature([Blog]),
	],
	exports: [BlogsService]
})
export class BlogsModule {}
