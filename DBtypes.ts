import { Queries } from "./DbQueries";
import { Table } from "./Table";



export type query<T> = [Queries, string, { where?: (record: T) => boolean, count?: number, record?: T, records?: T[], parent?: Table<T>, call_back?: (record: T) => any }]