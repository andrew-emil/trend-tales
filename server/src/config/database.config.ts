import { registerAs } from "@nestjs/config";
import * as joi from "joi";

export default registerAs("database", () => {
	const config = {
		host: process.env.DB_HOST,
		databaseName: process.env.DB_NAME,
		port: parseInt(process.env.PORT || "", 10),
		databaseUser: process.env.DB_USER,
		databasePassword: process.env.DB_PASS,
	};

	const envVars = {
		DB_HOST: process.env.DB_HOST,
		DB_NAME: process.env.DB_NAME,
		PORT: process.env.PORT,
		DB_USER: process.env.DB_USER,
		DB_PASS: process.env.DB_PASS,
	};

	const { error } = joi
		.object(databaseSchema)
		.validate(envVars, { abortEarly: false });
	if (error) {
		throw new Error(`database configuration validation error: ${error.message}`);
	}

	return config;
});

export const databaseSchema = {
	DB_HOST: joi.string().required(),
	DB_NAME: joi.string().required(),
	PORT: joi.string().required().default("5432"),
	DB_USER: joi.string().required(),
	DB_PASS: joi.string().required(),
};
