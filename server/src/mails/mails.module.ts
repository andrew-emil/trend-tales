import { Module, Global } from "@nestjs/common";
import { MailsService } from "./mails.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { EjsAdapter } from "@nestjs-modules/mailer/dist/adapters/ejs.adapter";

@Global()
@Module({
	providers: [MailsService],
	exports: [MailsService],
	imports: [
		ConfigModule,
		MailerModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				return {
					transport: {
						host: config.get<string>("MAIL_HOST"),
						secure: false,
						port: 587,
						auth: {
							user: config.get<string>("SMTP_USERNAME"),
							pass: config.get<string>("SMTP_PASSWORD"),
						},
						defaults: {
							from: `Trend trails <no-reply@trendtrails.com>`,
						},
						template: {
							dir: join(__dirname, "templates"),
							adapter: new EjsAdapter({
								inlineCssEnabled: true,
							}),
							options: {
								strict: false,
							},
						},
					},
				};
			},
		}),
	],
})
export class MailsModule {}
