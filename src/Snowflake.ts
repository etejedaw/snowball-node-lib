import * as snowflake from "snowflake-sdk";
import type { Connection, ConnectionOptions } from "snowflake-sdk";

export class Snowflake {
	readonly #connection: Connection;

	constructor(connectionOptions: ConnectionOptions) {
		this.#connection = snowflake.createConnection(connectionOptions);
	}

	async connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.#connection.connectAsync((error, _conn) => {
				if (error)
					return reject(
						new Error(`Connection Error: ${error.message}`)
					);
				console.log(`Connection Successful`);
				return resolve();
			});
		});
	}

	async execQuery<T>(query: string): Promise<T[]> {
		return new Promise((resolve, reject) => {
			this.#connection.execute({
				sqlText: query,
				complete: (error, _stmt, rows) => {
					if (error)
						return reject(
							new Error(`Error in query: ${error.message}`)
						);
					return resolve(rows as T[]);
				}
			});
		});
	}

	async destroy(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.#connection.destroy((error, _conn) => {
				if (error)
					return reject(
						new Error(`Connection Error: ${error.message}`)
					);
				console.log(`Connection Destroy Successful`);
				return resolve();
			});
		});
	}
}
