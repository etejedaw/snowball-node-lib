import { DataType } from "snowflake-sdk";
import { Snowflake } from "./Snowflake";
import { QueryBuilder } from "./QueryBuilder";

export abstract class SnowflakeModel {
	static tableName: string;
	static fields: ModelFields;
	static instance: Snowflake;

	static init(options: ModelInitOptions, fields: ModelFields) {
		this.tableName = options.tableName;
		this.instance = options.instace;
		this.fields = fields;
	}

	static async find(query?: QueryOptions) {
		const select = query?.select;
		const where = query?.where;
		const limit = query?.limit;

		const queryBuilder = QueryBuilder.from(this.tableName)
			.select(select)
			.where(where)
			.limit(limit)
			.build();

		await this.instance.connect();
		return this.instance.execQuery(queryBuilder);
	}

	static async findOne(query: QueryOptions) {
		//TODO
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
	where?: object;
	limit?: number;
}

type ModelFields = Record<string, FieldOptions>;
