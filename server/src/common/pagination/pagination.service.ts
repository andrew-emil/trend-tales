import { Inject, Injectable } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import {
	FindOptionsOrder,
	FindOptionsRelations,
	FindOptionsSelect,
	FindOptionsWhere,
	ObjectLiteral,
	Repository,
} from "typeorm";
import { PaginationDto } from "./dtos/pagination.dto";
import { Paginated } from "./interface/paginated.interface";

@Injectable()
export class PaginationService {
	constructor(
		@Inject(REQUEST)
		private readonly request: Request
	) {}

	public async paginate<T extends ObjectLiteral>(
		model: Repository<T>,
		paginationQuery: PaginationDto,
		where?: FindOptionsWhere<T>,
		sort?: FindOptionsOrder<T>,
		relations?: FindOptionsRelations<T>,
		select?: FindOptionsSelect<T>
	): Promise<Paginated<T>> {
		const { limit, page } = paginationQuery;
		const skip = (page! - 1) * limit!;

		const [result, totalItems] = await model.findAndCount({
			where,
			skip,
			take: limit,
			order: sort,
			relations,
			select,
		});

		const totalPages = Math.ceil(totalItems / paginationQuery.limit!);
		const nextPage =
			paginationQuery.page === totalPages
				? paginationQuery.page
				: paginationQuery.page! + 1;

		const previousPage =
			paginationQuery.page === 1
				? paginationQuery.page
				: paginationQuery.page! - 1;

		const baseUrl = `${this.request.protocol}://${this.request.get("host")}`;
		const url = new URL(this.request.url, baseUrl);

		const response: Paginated<T> = {
			data: result,
			meta: {
				itemsPerPage: paginationQuery.limit!,
				totalItems,
				totalPages,
				currentPage: paginationQuery.page!,
			},
			links: {
				first: `${url.origin}${url.pathname}?limit=${paginationQuery.limit}&page=1`,
				last: `${url.origin}${url.pathname}?limit=${paginationQuery.limit}&page=${totalPages}`,
				next: `${url.origin}${url.pathname}?limit=${paginationQuery.limit}&page=${nextPage}`,
				previous: `${url.origin}${url.pathname}?limit=${paginationQuery.limit}&page=${previousPage}`,
			},
		};

		return response;
	}
}
