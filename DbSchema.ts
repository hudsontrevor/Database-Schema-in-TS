import { styleText } from "util"
import { Queries } from "./DbQueries";
import { query } from "./DBtypes";
import { Table } from "./Table";
import { Query } from "./QueryClient";
export class Database {


    readonly #DB: Table<any>[] = []

    //write tables 
    declare_table<RecordSchema>(table_name: string): Table<RecordSchema> { if (this.#DB.some((v) => v.get_name().toString() == table_name.toString())) { throw new Error(styleText("redBright", `A Table Under The name '${table_name}' already Exists in The DB .. Consider changing the name to  '_${table_name} '`)) } this.#DB.push(new Table<RecordSchema>(table_name)); return this.#DB[this.#DB.length - 1] }
    declare_tables<RecordSchema>(table_names: string[]) { table_names.forEach((table_name) => { if (this.#DB.some((v) => v.get_name().toString() == table_name.toString())) { throw new Error(styleText("redBright", `A Table Under The name '${table_name}' already Exists in The DB .. Consider changing the name to  '_${table_name} '`)) } this.#DB.push(new Table<RecordSchema>(table_name)); }) }

    // read tables 
    get_table(table_name: string): Table<any> { const table = this.#DB.find((v) => v.get_name() == table_name); if (!table) { throw new Error(styleText("redBright", `Table  ${table_name} does not exist`)) }; return table }
    get_table_assert<RecordSchema>(table_name: string): Table<RecordSchema> { try { return this.get_table(table_name) as Table<RecordSchema> } catch (error) { console.log(`${styleText("bgRed", `Error -->${this.get_table_assert.name}`)} \n ${error}`); process.exit(1) } }
    readonly get_tables = (): string[] => this.#DB.flatMap((V) => V.get_name())

}


//// EXAMPLE IMPLIMENTSTION

// type Users = {
//     name: string,
//     id: number,
//     address: string,
//     username: string,
//     email: string
// }
// const DB = new Database()
// const Query_Client = new Query(DB)
// let table_name = "TABLE"
// Query_Client.add_table<Users>(table_name)




// Query_Client.query_table<Users>([Queries.INSERT, table_name, { record: { address: "", email: Math.random().toString(), id: 1, name: "", username: "" } }])
// Query_Client.query_table<Users>([Queries.INSERT, table_name, { record: { address: "", email: Math.random().toString(), id: 1, name: "", username: "" } }])
// Query_Client.query_table<Users>([Queries.INSERT, table_name, { record: { address: "", email: Math.random().toString(), id: 1, name: "", username: "" } }])
// Query_Client.query_table<Users>([Queries.INSERT, table_name, { record: { address: "", email: Math.random().toString(), id: 1, name: "", username: "" } }])
// Query_Client.query_table<Users>([Queries.INSERT, table_name, { record: { address: "", email: Math.random().toString(), id: 1, name: "", username: "" } }])
// Query_Client.query_table<Users>([Queries.INSERT, table_name, { record: { address: "", email: Math.random().toString(), id: 1, name: "", username: "" } }])
// Query_Client.query_table<Users>([Queries.INSERT, table_name, { record: { address: "", email: Math.random().toString(), id: 1, name: "", username: "" } }])
// Query_Client.query_table<Users>([Queries.INSERT, table_name, { record: { address: "", email: Math.random().toString(), id: 1, name: "", username: "" } }])
// Query_Client.query_table<Users>([Queries.INSERT, table_name, { record: { address: "", email: Math.random().toString(), id: 1, name: "", username: "" } }])
// Query_Client.query_table<Users>([Queries.INSERT, table_name, { record: { address: "", email: Math.random().toString(), id: 1, name: "", username: "" } }])

// console.log(Query_Client.query_table<Users>([Queries.SELECT_ALL, table_name, { where: (record) => Number(record.email) < 0.5 }]))



// // we can impliment a token nizer 
