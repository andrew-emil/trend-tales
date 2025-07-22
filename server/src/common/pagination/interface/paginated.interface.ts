import { ObjectLiteral } from "typeorm";

export interface Paginated {
	data: ObjectLiteral[];
	meta: {
		itemsPerPage: number;
		totalItems: number;
		currentPage: number;
		totalPages: number;
	};
	links: {
		first: string;
		last: string;
		next: string;
		previous: string;
	};
}
