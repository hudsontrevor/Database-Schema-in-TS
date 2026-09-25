import { Queries } from "./DbQueries";
import { Database } from "./DbSchema";
import { query } from "./DBtypes";
import { Table } from "./Table";
import { styleText } from "util"
import { Tokens } from "./Tokenizer";
/**
 * Aids in querying tables
 */
export class Query {
    #DB: Database;
    constructor(db: Database) {
        this.#DB = db
    }
    private match<RecordSchema>(table: Table<RecordSchema>, Query: [Queries, query<RecordSchema>[2]]) {
        switch (Query[0].toUpperCase()) {
            case ("DELETE"): return table.delete(Query[1].where!)
            case ("INHERIT"): return table.take(Query[1].parent!)
            case ("INSERT"): return table.add_record(Query[1].record!)
            case ("INSERT_IF_EVERY"): return table.add_if_every(Query[1].record!, Query[1].where!)
            case ("INSERT_IF_SOME"): return table.add_if_some(Query[1].record!, Query[1].where!)
            case ("SELECT_ALL"): return table.select_all(Query[1].where ? Query[1].where : () => true)
            case ("SELECT_ONCE"): return table.select_once(Query[1].where!)
            case ("SET"): return table.set(Query[1].record!)
            case ("UPDATE_ALL"): return table.update_all(Query[1].call_back!, Query[1].where ? Query[1].where : () => true)
            case ("UPDATE_ONCE"): return table.update_once(Query[1].call_back!)
            case ("WIPE"): return table.wipe()
            case ("ABSORB"): return table.absorb(Query[1].records!)
        }

        throw new Error(`Action ${Query[0]} not in store . SEE Queries `)
    }

    /**
     * 
     * @param query to execute
     * @returns appropriate  to the query 
     */
    query_table<RecordSchema>(query: string, details?: query<RecordSchema>[2]) {
        try {
            let Qry = Tokens.tokenize(query)
            return this.match(this.#DB.get_table_assert<RecordSchema>(Qry.table), [Qry.action as Queries, details || {}])
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

const DB = new Database()
const Query_client = new Query(DB);
type Users = {
    name: string,
    id: number
}
Query_client.add_table("USERS")

Query_client.query_table<Users>("INSERT into USERS ", { record: { id: 23 * Math.random(), name: "HUDSON" } })
Query_client.query_table<Users>("INSERT into USERS ", { record: { id: 23 * Math.random(), name: "HUDSON" } })
Query_client.query_table<Users>("INSERT into USERS ", { record: { id: 23 * Math.random(), name: "HUDSON" } })
Query_client.query_table<Users>("INSERT into USERS ", { record: { id: 23 * Math.random(), name: "HUDSON" } })
Query_client.query_table<Users>("INSERT into USERS ", { record: { id: 23 * Math.random(), name: "HUDSON" } })
Query_client.query_table<Users>("INSERT into USERS ", { record: { id: 23 * Math.random(), name: "HUDSON" } })
Query_client.query_table<Users>("INSERT into USERS ", { record: { id: 23 * Math.random(), name: "HUDSON" } })
Query_client.query_table<Users>("INSERT into USERS ", { record: { id: 23 * Math.random(), name: "HUDSON" } })
Query_client.query_table<Users>("INSERT into USERS ", { record: { id: 23 * Math.random(), name: "HUDSON" } })
Query_client.query_table<Users>("INSERT into USERS ", { record: { id: 23 * Math.random(), name: "HUDSON" } })
Query_client.query_table<Users>("INSERT into USERS ", { record: { id: 23 * Math.random(), name: "HUDSON" } })


console.log(Query_client.query_table<Users>("update_all        into  USERS  .. .. ", { where: (rec) => rec.id < 14, call_back: (rec) => { rec.name = "BOTS NI MSHENZI " } }))
console.log(Query_client.query_table("select_all        from  USERS "))


// [
//   { id: 4.058930477642997, name: 'BOTS NI MSHENZI ' },
//   { id: 16.567265083808394, name: 'HUDSON' },
//   { id: 6.9718559360504875, name: 'BOTS NI MSHENZI ' },
//   { id: 11.596134722898196, name: 'BOTS NI MSHENZI ' },
//   { id: 17.690735668897382, name: 'HUDSON' },
//   { id: 6.51998093180944, name: 'BOTS NI MSHENZI ' },
//   { id: 20.02108888910648, name: 'HUDSON' },
//   { id: 19.84149452496155, name: 'HUDSON' },
//   { id: 14.58301489454473, name: 'HUDSON' },
//   { id: 17.39067902192524, name: 'HUDSON' },
//   { id: 2.1825535415947366, name: 'BOTS NI MSHENZI ' }
// ]