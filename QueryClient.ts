import { Queries } from "./DbQueries";
import { Database } from "./DbSchema";
import { query } from "./DBtypes";
import { Table } from "./Table";
import { styleText } from "util"
/**
 * Aids in querying tables
 */
export class Query {
    #DB: Database;
    constructor(db: Database) {
        this.#DB = db
    }
    private match<RecordSchema>(table: Table<RecordSchema>, Query: query<RecordSchema>) {
        switch (Query[0]) {
            case (Queries.DELETE): return table.delete(Query[2].where!)
            case (Queries.INHERIT): return table.take(Query[2].parent!)
            case (Queries.INSERT): return table.add_record(Query[2].record!)
            case (Queries.INSERT_IF_EVERY): return table.add_if_every(Query[2].record!, Query[2].where!)
            case (Queries.INSERT_IF_SOME): return table.add_if_some(Query[2].record!, Query[2].where!)
            case (Queries.SELECT_ALL): return table.select_all(Query[2].where!)
            case (Queries.SELECT_ONCE): return table.select_once(Query[2].where!)
            case (Queries.SET): return table.set(Query[2].record!)
            case (Queries.UPDATE_ALL): return table.update_all(Query[2].call_back!)
            case (Queries.UPDATE_ONCE): return table.update_once(Query[2].call_back!)
            case (Queries.WIPE): return table.wipe()
            case (Queries.ABSORB): return table.absorb(Query[2].records!)
        }
    }

    /**
     * 
     * @param query to execute
     * @returns appropriate  to the query 
     */
    query_table<RecordSchema>(query: query<RecordSchema>) {
        try {
            return this.match(this.#DB.get_table(query[1]), query)
        } catch (error) {
            console.log(styleText("bgRedBright", "ERROR :  "), styleText("redBright", `${error}`))
        }
    }
    /**
     * adds a table to the DB
     * @param table_name of table to add 
     */
    add_table<RecordSchema>(table_name: string) { this.#DB.declare_table<RecordSchema>(table_name) }


    /**
     * adds  tables  to the DB
     * @param table_names  to add 
     */
    add_tables<RecordSchema>(table_names: string[]) { table_names.forEach((v) => this.#DB.declare_table<RecordSchema>(v)) }
}
