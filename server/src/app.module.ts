import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { PaginationModule } from "./common/pagination/pagination.module";
import databaseConfig from "./config/database.config";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [databaseConfig],
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
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
