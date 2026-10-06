import { styleText } from "util"
import { Table } from "./Table";
export class Database {


    readonly #DB: Table<any>[] = []

    //write tables 
    declare_table<RecordSchema>(table_name: string): Table<RecordSchema> { if (this.#DB.some((v) => v.get_name().toString() == table_name.toString())) { throw new Error(styleText("redBright", `A Table Under The name '${table_name}' already Exists in The DB .. Consider changing the name to  '_${table_name} '`)) } this.#DB.push(new Table<RecordSchema>(table_name)); return this.#DB[this.#DB.length - 1] }
    declare_tables<RecordSchema>(table_names: string[], call_back: (table: Table<any>) => void) { table_names.forEach((table_name) => { if (this.#DB.some((v) => v.get_name().toString() == table_name.toString())) { throw new Error(styleText("redBright", `A Table Under The name '${table_name}' already Exists in The DB .. Consider changing the name to  '_${table_name} '`)) }; let table = new Table<RecordSchema>(table_name); call_back(table); this.#DB.push(table); }) }

    // read tables 
    get_table(table_name: string): Table<any> { const table = this.#DB.find((v) => v.get_name() == table_name); if (!table) { throw new Error(styleText("redBright", `Table  ${table_name} does not exist try ${this.get_tables().join(" or ")}`)) }; return table }
    get_table_assert<RecordSchema>(table_name: string): Table<RecordSchema> { try { return this.get_table(table_name) as Table<RecordSchema> } catch (error) { console.log(`${styleText("bgRed", `Error -->${this.get_table_assert.name}`)} \n ${error}`); process.exit(1) } }
    readonly get_tables = (): string[] => this.#DB.flatMap((V) => V.get_name())

}


//// EXAMPLE IMPLIMENTATION

// type Users = {
//     name: string,
//     id: number,
//     address: string,
//     username: string,
//     email: string
// }
// const DB: Database = new Database()
// DB.declare_table<Users>("USERS").add_record({
//     name: "",
//     id: 0,
//     address: "",
//     username: "",
//     email: ""
// })

// DB.get_table_assert<Users>("USERS")


// we can impliment a token nizer 
