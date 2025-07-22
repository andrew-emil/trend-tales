import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { User } from "src/users/entities/user.entity";

@Injectable()
export class MailsService {
	constructor(private readonly mailerService: MailerService) {}

	public async sendWelcomeEmail(user: User) {
		await this.mailerService.sendMail({
			to: user.email,
			from: `Onboarding <support@example.com>`,
			subject: `Welcome to the Trend Trails`,
			template: "./welcome",
			context: {
				fullname: user.fullName,
				email: user.email,
			},
		});
	}

	public async sendResetPasswordEmail(email: string, fullname: string) {
		await this.mailerService.sendMail({
			to: email,
			from: `Onboarding <support@example.com>`,
			subject: `Welcome to the Trend Trails`,
			template: "./welcome",
			context: {
				name: fullname,
				resetPasswordLink: process.env.RESET_PASSWORD_URL,
			},
		});
	}
}
