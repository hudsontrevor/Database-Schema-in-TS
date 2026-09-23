

export class Table<RecordSchema> {
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
    readonly delete_ = (evaluate: (record: RecordSchema) => boolean): boolean => { let done: boolean = false; this.#records = this.#records.filter((v) => { let ev = evaluate(v); if (ev) { done = true }; return ev }); return done }

};


