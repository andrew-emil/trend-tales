import { forwardRef, Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { AuthModule } from "src/auth/auth.module";

@Module({
	controllers: [UsersController],
	providers: [UsersService],
	imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
	exports: [UsersService, TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
