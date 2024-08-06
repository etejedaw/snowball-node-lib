import { DataType } from "snowflake-sdk";
import { Snowflake } from "./Snowflake";
import { QueryBuilder } from "./QueryBuilder";

export abstract class SnowballModel {
	static tableName: string;
	static fields: ModelFields;
	static instance: Snowflake;

	constructor(params: Partial<any>) {
		Object.assign(this, params);
	}

	static init(options: ModelInitOptions, fields: ModelFields) {
		this.tableName = options.tableName;
		this.instance = options.instance;
		this.fields = fields;
	}

	static async find(query?: QueryOptions) {
		const select = this.buildSelect(query?.select);
		const where = this.buildWhere(query?.where);
		const limit = query?.limit;

		const queryBuilder = QueryBuilder.from(this.tableName)
			.select(select)
			.where(where)
			.limit(limit)
			.build();

		await this.instance.connect();
		const data = await this.instance.execQuery(queryBuilder);
		return data;
	}

	static async findOne(query: Omit<QueryOptions, "limit">) {
		const select = this.buildSelect(query?.select);
		const where = this.buildWhere(query?.where);
		const queryBuilder = QueryBuilder.from(this.tableName)
			.select(select)
			.where(where)
			.build();

		await this.instance.connect();
		const exec = await this.instance.execQuery(queryBuilder);
		if (!exec[0]) return;
		return exec[0];
	}

	static create<T extends SnowballModel>(
		this: new (params: Partial<T>) => T,
		params: Partial<T>
	): T {
		return new this(params);
	}

	static async query(query: string) {
		return await this.instance.execQuery(query);
	}

	private static buildSelect(select: string[] = []) {
		if (select.length === 0)
			return Object.keys(this.fields).map(select =>
				this.fields[select].databaseName
					? `"${this.fields[select].databaseName}" AS "${select}"`
					: `"${select}"`
			);
		return select.map(
			select =>
				`"${this.fields[select].databaseName}" AS "${select}"` ||
				`"${select}"`
		);
	}

	private static buildWhere(
		where: Record<string, any> = {}
	): Record<string, any> {
		return Object.keys(where || {}).reduce((acc, val) => {
			const fieldOptions = this.fields[val];
			const key = fieldOptions.databaseName || val;
			const value = where![val];
			acc[key] = value;
			return acc;
		}, {} as Record<string, any>);
	}
}

interface ModelInitOptions {
	tableName: string;
	instance: Snowflake;
}

interface FieldOptions {
	type: DataType;
	databaseName?: string;
}

interface QueryOptions {
	select?: string[];
	where?: Record<string, any>;
	limit?: number;
}

type ModelFields = Record<string, FieldOptions>;
