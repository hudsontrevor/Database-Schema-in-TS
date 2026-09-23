import { styleText } from "util"
class Database {


    readonly #DB: Table<any>[] = []

    //write tables 
    declare_table<RecordSchema extends { id: string }>(table_name: string): Table<RecordSchema> { if (this.#DB.some((v) => v.get_name().toString() == table_name.toString())) { throw new Error(styleText("redBright", `A Table Under The name '${table_name}' already Exists in The DB .. Consider changing the name to  '_${table_name} '`)) } this.#DB.push(new Table<RecordSchema>(table_name)); return this.#DB[this.#DB.length - 1] }
    declare_tables<RecordSchema extends { id: string }>(table_names: string[]) { table_names.forEach((table_name) => { if (this.#DB.some((v) => v.get_name().toString() == table_name.toString())) { throw new Error(styleText("redBright", `A Table Under The name '${table_name}' already Exists in The DB .. Consider changing the name to  '_${table_name} '`)) } this.#DB.push(new Table<RecordSchema>(table_name)); }) }

    // read tables 
    get_table(table_name: string): Table<any> { const table = this.#DB.find((v) => v.get_name() == table_name); if (!table) { throw new Error(styleText("redBright", `Table  ${table_name} does not exist`)) }; return table }
    get_table_assert<RecordSchema>(table_name: string): Table<RecordSchema> { try { return this.get_table(table_name) as Table<RecordSchema> } catch (error) { console.log(`${styleText("bgRed", `Error -->${this.get_table_assert.name}`)} \n ${error}`); process.exit(1) } }
    readonly get_tables = (): string[] => this.#DB.flatMap((V) => V.get_name())

}


class Table<RecordSchema> {
    private table_name: string;
    constructor(table_name: string) { this.table_name = table_name }
    readonly get_name = () => `${this.table_name}`
    #records: RecordSchema[] = []
    readonly logs_length = (): number => this.#records.length
    // update 
    readonly update_all = (call_back: (record: RecordSchema) => boolean): boolean => { let is_updated: boolean = false; this.#records.map((record) => { let c = call_back(record); is_updated = !is_updated ? c : true; return record }); return is_updated }
    readonly update_once = (callback: (record: RecordSchema) => boolean): boolean => { let s = 0; let e = this.#records.length - 1; while (s <= e) { if (callback(this.#records[s])) { return true }; if (callback(this.#records[e])) { return true }; s++; e-- } return false }
    //read 
    readonly select_all = (evalate: (record: RecordSchema) => boolean): RecordSchema[] => this.#records.filter((v) => evalate(v))
    readonly select_once = (evalate: (record: RecordSchema) => boolean): RecordSchema | null => { let s = 0; let e = this.#records.length - 1; while (s <= e) { let hold: boolean[] = [s, e].flatMap((v) => evalate(this.#records[v])); if (hold[1] || hold[0]) { return hold[0] ? this.#records[s] : this.#records[e] }; s++; e-- } return null }
    // write 
    readonly add_record = (record: RecordSchema): RecordSchema => { this.#records.push(record); return record }
    readonly add_if_some = (record: RecordSchema, evaluate: (record_: RecordSchema) => boolean): boolean => { if (this.#records.some((v) => evaluate(v))) { this.#records.push(record); return true }; return false }
    readonly add_if_every = (record: RecordSchema, evaluate: (record_: RecordSchema) => boolean): boolean => { if (this.#records.every((v) => evaluate(v))) { this.#records.push(record); return true }; return false }
    readonly set = (record: RecordSchema) => this.add_if_every(record, (rec) => JSON.stringify(rec) != JSON.stringify(record))

    // wholesome
    readonly wipe = () => { this.#records = [] }
    readonly take = (parent: Table<RecordSchema>): Table<RecordSchema> => { this.#records = parent.#records; return this }

    // delete 
    readonly delete_ = (record: RecordSchema): boolean => { let done: boolean = false; this.#records = this.#records.filter((v) => { if (JSON.stringify(v) != JSON.stringify(record)) { done = true }; return JSON.stringify(v) != JSON.stringify(record) }); return done }

};




export enum Queries {
    SELECT_ALL = 1,
    SELECT_ONCE = 2,
    UPDATE_ALL = 4,
    UPDATE_ONCE = 8,
    INSERT = 16,
    INSERT_IF_SOME = 32,
    INSERT_IF_EVERY = 64,
    SET = 128,
    WIPE = 256,
    INHERIT = 512,
    DELETE = 1024
}

export type query<T> = [Queries, string, { where: (record: T) => boolean, count?: number, record?: T, parent?: Table<T>, call_back: (record: T) => any }]
export class Query {
    #DB: Database;
    constructor(db: Database) {
        this.#DB = db
    }

    private match<RecordSchema>(table: Table<RecordSchema>, Query: query<RecordSchema>) {
        switch (Query[0]) {
            case (Queries.DELETE): return table.delete_(Query[2].record!)
            case (Queries.INHERIT): return table.take(Query[2].parent!)
            case (Queries.INSERT): return table.add_record(Query[2].record!)
            case (Queries.INSERT_IF_EVERY): return table.add_if_every(Query[2].record!, Query[2].where)
            case (Queries.INSERT_IF_SOME): return table.add_if_some(Query[2].record!, Query[2].where)
            case (Queries.SELECT_ALL): return table.select_all(Query[2].where)
            case (Queries.SELECT_ONCE): return table.select_once(Query[2].where)
            case (Queries.SET): return table.set(Query[2].record!)
            case (Queries.UPDATE_ALL): return table.update_all(Query[2].call_back)
            case (Queries.UPDATE_ONCE): return table.update_once(Query[2].call_back)
            case (Queries.WIPE): return table.wipe()
        }
    }

    query<RecordSchema>(query: query<RecordSchema>) {
        try {
            this.match(this.#DB.get_table(query[1]), query)
        } catch (error) {
            console.log(styleText("bgRedBright", "ERROR :  "), styleText("redBright", `${error}`))
        }
    }










}
const DB = new Query(new Database())
DB.query<{ id: string, name: string }>([Queries.SET, "USERS", { record: { id: "name", name: "rada " }, call_back: (record) => { }, where: () => true }])
