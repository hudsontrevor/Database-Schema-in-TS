import { Worker } from "node:worker_threads";
import { ManagerOptions, query, worker_query } from "./DBtypes";
import { Query } from "./QueryClient";
import { Table } from "./Table";
import { work } from "./Manager";

/**
 * Manages a table, repeatedly executing queries to that table after an interval, either on this thread or on another if specified as such 
 */
export class ManageTable<T> {
    #queries: (ManagerOptions<T>["queries"][1] & { readonly ref: number })[];
    #table: Table<T>;
    static #worker: Worker | undefined;
    readonly get_worker = () => ManageTable.#worker
    /**
     * 
     * @param table to manage 
     * @param manager_options 
     * @param read_from file to load onto worker. once the  first instance of this object is created, that consumes the worker, no other file can be loaded onto worker thread by instanciating a new instace of `this` object 
     * @returns 
     */
    constructor(
        table: Table<T>,
        manager_options: ManagerOptions<T> = { queries: [], interval_between_snooze: 5000, on_this_thread: true },

        read_from: string = "Manager.ts"
    ) {
        this.#queries = manager_options.queries.flatMap((query) => { let hold = Math.round(query.after / manager_options.interval_between_snooze!); return { ...query, after: hold, ref: hold } });
        this.#table = table
        this.manage(manager_options.interval_between_snooze!, manager_options.on_this_thread!)
        if (manager_options.on_this_thread) {
            return
        }

        if (!ManageTable.#worker) {
            ManageTable.#worker = new Worker(read_from)

            ManageTable.#worker.on("error", (err) => {
                console.log("Error in worker. Table manager ", err)
                ManageTable.#worker?.terminate().finally(() => {
                    ManageTable.#worker = new Worker(read_from)
                })
            })

        }
    }


    /**
     * pusshes a qury to the query queue
     * @param query to append to list of queries to be executed on the table 
     */
    readonly add_query = (query: ManagerOptions<T>["queries"][0]) => { this.#queries.push({ ...query, ref: query.after }) }

    private manage(interval: number, on_this_thread: boolean) {

        // should return a promise 
        let bundle: worker_query<T>;
        setInterval(() => {
            bundle = { queries: [], records: undefined }
            this.#queries.map((query) => {
                if (query.after != 0) {
                    query.after--
                    return query
                }
                bundle.queries.push({ query: query.query, details: query.details })
                if (!query.always) {
                    this.#queries = this.#queries.filter((query_) => JSON.stringify(query) != JSON.stringify(query_))
                    return query
                } else {
                    query.after = query.ref
                    return query
                }
            })
            if (!bundle.queries.length) { return }
            if (on_this_thread) {
                work<T>(bundle, this.#table)
                return
            }

            bundle.records = [...this.#table.select_all(() => true, () => true)]
            ManageTable.#worker?.postMessage(bundle)
            ManageTable.#worker?.on("message", (new_records: T[]) => {
                this.#table.wipe()
                this.#table.absorb(new_records)
            })
        }, interval)
    }


}

export { worker_query };
