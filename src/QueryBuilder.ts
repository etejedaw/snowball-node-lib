export class QueryBuilder {
	#tableName: string;
	#selectFields: string[];
	#whereConditions: string[];
	#limitCondition: number;

	private constructor(tableName: string) {
		this.#tableName = tableName;
		this.#selectFields = [];
		this.#whereConditions = [];
		this.#limitCondition = 0;
	}

	static from(tableName: string) {
		return new QueryBuilder(tableName);
	}

	select(selectFields?: string[]) {
		if (!selectFields || selectFields.length === 0)
			this.#selectFields.push("*");
		else this.#selectFields = selectFields;
		return this;
	}

	where(conditions?: Record<string, any>) {
		if (conditions) {
			const whereClauses = Object.entries(conditions).map(
				([key, value]) => `"${key}"='${value}'`.trim()
			);
			this.#whereConditions.push(...whereClauses);
		}
		return this;
	}

	limit(limit?: number) {
		if (limit) this.#limitCondition = limit;
		return this;
	}

	build() {
		const select = this.#createSelect(this.#selectFields);
		const from = this.#createFrom(this.#tableName);
		const where = this.#createWhere(this.#whereConditions);
		const limit = this.#createLimit(this.#limitCondition);
		return `${select} ${from} ${where} ${limit}`.trim();
	}

	#createSelect(select: string[]) {
		return `SELECT ${select.join(" ")}`.trim();
	}

	#createFrom(tableName: string) {
		return `FROM ${tableName}`.trim();
	}

	#createWhere(whereCondition: string[]) {
		if (whereCondition.length === 0) return ``;
		return `WHERE ${whereCondition.join(" ")}`.trim();
	}

	#createLimit(limit: number) {
		if (limit === 0) return ``;
		return `LIMIT ${limit}`.trim();
	}
}
