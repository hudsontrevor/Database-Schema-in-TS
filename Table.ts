

export class Table<RecordSchema> {
    #table_name: string;
    constructor(table_name: string) { this.#table_name = table_name }
    /**
     * 
     * @returns table name 
     */
    readonly get_name = () => `${this.#table_name}`
    #records: RecordSchema[] = []
    /**
     * 
     * @returns length of record 
     */
    readonly logs_length = (): number => this.#records.length
    // update 
    /**
     * updates all elements 
     * @param call_back a call back to execute on all items . Return a boolean value which is reflected back to if any modifiv=cation occured 
     * @returns true if modification occured 
     */
    readonly update_all = (call_back: (record: RecordSchema) => boolean, where: (record: RecordSchema) => boolean): boolean => { let is_updated: boolean = false; this.#records.map((record) => { if (!where(record)) { return }; let c = call_back(record); is_updated = !is_updated ? c : true; return record }); return is_updated }
    /**
     * updates the first occurence 
     * @param callback on all items/records that return a bool value signalling halting of further itteration if true 
     * @returns  true if modification occured  else false 
     */
    readonly update_once = (callback: (record: RecordSchema) => boolean): boolean => { let s = 0; let e = this.#records.length - 1; while (s <= e) { if (callback(this.#records[s])) { return true }; if (callback(this.#records[e])) { return true }; s++; e-- } return false }
    //read 

    /**
     * Selects all element by the criteria 
     * @param evalate a call back to elements to specify your criteria 
     * @returns elemants[]
     */
    readonly select_all = (evalate: (record: RecordSchema) => boolean): RecordSchema[] => this.#records.filter((v) => evalate(v))

    /** 
     * Selects the first occurence of an element matching the criteria 
     * @param evalate a call back to elements to specify your criteria and to signal halt of further cruteria if return is true 
     * @returns element  
     */
    readonly select_once = (evalate: (record: RecordSchema) => boolean): RecordSchema | null => { let s = 0; let e = this.#records.length - 1; while (s <= e) { let hold: boolean[] = [s, e].flatMap((v) => evalate(this.#records[v])); if (hold[1] || hold[0]) { return hold[0] ? this.#records[s] : this.#records[e] }; s++; e-- } return null }
    // write 
    /**
     * Adds a record 
     * @param record record to add 
     * @returns record added 
     */
    readonly add_record = (record: RecordSchema): RecordSchema => { this.#records.push(record); return record }

    /**
     * Adds a record if some existing records meet the criteria provided
     * @param record record to add 
     * @param evaluate call back to all elements that returns a bool to gauge criteria for selection if some elements hold up to the creteria 
     * @returns 
     */
    readonly add_if_some = (record: RecordSchema, evaluate: (record_: RecordSchema) => boolean): boolean => { if (this.#records.some((v) => evaluate(v))) { this.#records.push(record); return true }; return false }

    /**
     * Adds a record if every  existing record meets the criteria provided
     * @param record record to add 
     * @param evaluate call back to all elements that returns a bool to gauge criteria for selection if every  element holds up to the creteria 
     * @returns 
     */
    readonly add_if_every = (record: RecordSchema, evaluate: (record_: RecordSchema) => boolean): boolean => { if (this.#records.every((v) => evaluate(v))) { this.#records.push(record); return true }; return false }

    /**
     * adds an element if no other element present matches its signature - compares in stringified form 
     * @param record record to add
     * @returns 
     */
    readonly set = (record: RecordSchema) => this.add_if_every(record, (rec) => JSON.stringify(rec) != JSON.stringify(record))

    // wholesome
    /**
     * clears the table -- retaining the table name 
     */
    readonly wipe = () => { this.#records = [] }

    /**
     * allows the table to take records from a parent table 
     * @param parent table to take from 
     * @returns the current instance of the table 
     */
    readonly take = (parent: Table<RecordSchema>): Table<RecordSchema> => { this.#records = parent.#records; return this }

    /**
     * Adds a list of records to the table 
     * @param records to add 
     */
    readonly absorb = (records: RecordSchema[]) => { this.#records = this.#records.concat(records) }

    // delete 

    /**
     * removes  all records that meet the criteria provided 
     * @param evaluate a call back which returns true or false to either remove the element  or not  respectively 
     * @returns 
     */
    readonly delete = (evaluate: (record: RecordSchema) => boolean): boolean => { let done: boolean = false; this.#records = this.#records.filter((v) => { let ev = evaluate(v); if (ev) { done = true }; return ev }); return done }

};


