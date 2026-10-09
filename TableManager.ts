import { Worker } from "node:worker_threads";
import { query } from "./DBtypes";
import { Query } from "./QueryClient";
import { Table } from "./Table";
import { work } from "./Manager";

type query_<T> = {
    query: string,
    details?: query<T>[2],
}

export type worker_query<T> = {
    queries: {
        // query to execute see `Queries`
        query: string,
        //details of the query 
        details?: query<T>[2],
    }[],
    // a holder for records in table 
    records?: T[]
}

interface ManagerOptions<T> {
    /**
     * list of queries to be executed 
     */
    queries: (query_<T> & {
        /**
         *  after how long to execute this query `rounded of to the nearest interval_between_snooze` that is `Math.round(after/interval_between_snooze)`
         */
        after: number
        /**
         * wether to execute this query indefinetly. if `always` is set to true  `after` becomes the interval of execution of the query. if set to false, after is the countdown to query execution after which it is removed from the query pool 
         */
        always: boolean
    })[],
    /**
     * interval that gauges how often query evaluations should be made 
     */
    interval_between_snooze?: number,
    /**
     *  wether to run query evaluations on this thread or spin up a worker if false 
     */
    on_this_thread?: boolean
}

/**
 * Manages a table, repeatedly executing queries to that table either on this thread or on another if specified as such 
 */
export class ManageTable<T> {

    #queries: (ManagerOptions<T>["queries"][1] & { readonly ref: number })[];
    #table: Table<T>;
    #worker: Worker | undefined;
    readonly get_worker = () => this.#worker
    constructor(
        table: Table<T>,
        manager_options: ManagerOptions<T> = { queries: [], interval_between_snooze: 5000, on_this_thread: false },
        worker?: Worker
    ) {
        this.#queries = manager_options.queries.flatMap((query) => { let hold = Math.round(query.after / manager_options.interval_between_snooze!); return { ...query, after: hold, ref: hold } });
        this.#table = table
        // if (!manager_options.queries.length) { return }
        this.manage(manager_options.interval_between_snooze!)
        if (manager_options.on_this_thread) {
            return
        }
        this.#worker = worker || new Worker("Manager.ts")
    }

    readonly add_query = (query: ManagerOptions<T>["queries"][0]) => { this.#queries.push({ ...query, ref: query.after }) }

    private manage(interval: number, on_this_thread: boolean = false) {
        let bundle: worker_query<T>;
        setInterval(() => {
            bundle = { queries: [], records: undefined }
            this.#queries.map((query) => {
                if (query.after != 0) {
                    query.after--
                    return
                }
                bundle.queries.push({ query: query.query, details: query.details })
                if (!query.always) {
                    this.#queries = this.#queries.filter((query_) => JSON.stringify(query) != JSON.stringify(query_))
                } else {
                    query.after = query.ref
                }
            })
            if (!bundle.queries.length) { return }
            if (on_this_thread) {
                work<T>(bundle, this.#table)
                return
            }

            bundle.records = [...this.#table.select_all(() => true, () => true)]
            this.#worker?.postMessage(bundle)

            this.#worker?.on("message", (new_records: T[]) => {
                this.#table.wipe()
                this.#table.absorb(new_records)
            })
        }, interval)
    }


}