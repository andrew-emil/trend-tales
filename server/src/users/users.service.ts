import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BcryptProvider } from "src/auth/providers/bcrypt.provider";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		private readonly bcryptProvider: BcryptProvider
	) {}
	async findUserByEmail(email: string) {
		const user = await this.usersRepository.findOneBy({
			email,
		});

		return user;
	}

	async findUserByGoogleId(googleId: string) {
		const user = await this.usersRepository.findOneBy({
			google_id: googleId,
		});

		return user;
	}

	async findUserById(id: number) {
		const user = await this.usersRepository.findOneBy({
			id,
		});
		if (!user) {
			throw new NotFoundException("user not found");
		}

		return user;
	}

	async createUser(createUserDto: CreateUserDto) {
		const existingUser = await this.findUserByEmail(createUserDto.email);

		if (existingUser) throw new BadRequestException("User already exists");

		let hashedPassword: string = "";

		if (createUserDto.password) {
			hashedPassword = await this.bcryptProvider.hashPassword(
				createUserDto.password
			);
		}

		const newUser = this.usersRepository.create({
			...createUserDto,
			password_hash: hashedPassword,
		});

		return await this.usersRepository.save(newUser);
	}

	async updateUser(userId: number, updateUserDto: UpdateUserDto) {
		const user = await this.usersRepository.findOneBy({
			id: userId,
		});
		if (!user) throw new NotFoundException("User Not found");
		let hashedPassword = "";

		if (updateUserDto.password) {
			hashedPassword = await this.bcryptProvider.hashPassword(
				updateUserDto.password
			);
		} else {
			hashedPassword = user.password_hash ?? "";
		}

		return await this.usersRepository.update(
			{
				id: userId,
			},
			{
				...updateUserDto,
				password_hash: hashedPassword,
			}
		);
	}

	async deleteUser(userId: number) {
		const user = await this.usersRepository.findOneBy({ id: userId });
		if (!user) {
			throw new NotFoundException("user not found");
		}

		await this.usersRepository.delete({ id: user.id });
	}
}
