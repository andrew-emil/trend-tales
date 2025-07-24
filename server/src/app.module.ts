import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { PaginationModule } from "./common/pagination/pagination.module";
import databaseConfig from "./config/database.config";
import { UsersModule } from "./users/users.module";
import { MailsModule } from "./mails/mails.module";
import { BlogsModule } from './blogs/blogs.module';
import { CommentsModule } from './comments/comments.module';
import jwtConfig from "./config/jwt.config";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth/guards/auth.guard";
import { AccessTokenGuard } from "./auth/guards/access-token.guard";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ".env",
			load: [databaseConfig, jwtConfig],
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: "postgres",
				host: configService.get<string>("database.host"),
				port: configService.get<number>("database.port"),
				username: configService.get<string>("database.databaseUser"),
				password: configService.get<string>("database.databasePassword"),
				database: configService.get<string>("database.databaseName"),
				autoLoadEntities: true,
				synchronize: true,
			}),
		}),
		AuthModule,
		PaginationModule,
		UsersModule,
		MailsModule,
		BlogsModule,
		CommentsModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		AccessTokenGuard,
	],
})
export class AppModule {}
