import { DataType } from "snowflake-sdk";
import { Snowflake } from "./Snowflake";
import { QueryBuilder } from "./QueryBuilder";

export abstract class SnowballModel {
	static tableName: string;
	static fields: ModelFields;
	static instance: Snowflake;

	static init(options: ModelInitOptions, fields: ModelFields) {
		this.tableName = options.tableName;
		this.instance = options.instace;
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
		const exec = await this.instance.execQuery(queryBuilder);
		return this.mapResults(exec);
	}

	static async findOne(query: QueryOptions) {
		//TODO
	}

	private static buildSelect(select: string[] = []) {
		return select.map(
			select => `"${this.fields[select].databaseName}"` || `"${select}"`
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

	private static mapResults(results: any[]) {
		return results.map(result => {
			return Object.keys(this.fields).reduce((acc, key) => {
				const fieldOptions = this.fields[key];
				const dbName = fieldOptions.databaseName || key;
				acc[key] = result[dbName];
				return acc;
			}, {} as Record<string, any>);
		});
	}
}

interface ModelInitOptions {
	tableName: string;
	instace: Snowflake;
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
