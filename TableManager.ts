import { Transferable, Worker, workerData } from "node:worker_threads";
import { hold, ManagerOptions, query, worker_query } from "./DBtypes";
import { Table } from "./Table";
import { work } from "./Manager";
import { WorkerPool } from "./WorkerPool";



/**
 * Manages a table, repeatedly executing queries to that table after an interval, either on this thread or on another if specified as such 
 */

interface WorkersInternalState {
    is_busy: boolean,
    is_up_and_running: boolean
    logs: [States, any][]
}

enum States {
    GREEN = "GREEN",
    DIRE = "DIRE"
}



export class TableWorker extends Worker implements WorkersInternalState {

    constructor(file_name: string | URL, options?: WorkerOptions) {
        super(file_name, options);
        this.is_busy = false;
        this.is_up_and_running = true;
        this.logs = []
        super.on("error", (err) => {
            this.logs.push([States.DIRE, err])

            console.log(`
                -- error in worker 
                ${this.threadId}
                error -> ${err}
                logs show -- ${this.logs}    
                
                `)
        })
        super.on("message", (data) => this.tasks.shift()!(data))
    }
    is_busy: boolean;
    is_up_and_running: boolean;
    logs: [States, any][];

    tasks: ((args: any) => any)[] = []


    // process where fn to send data to worker 
    private process_queries<T>(query: worker_query<T>): hold<T> {
        let r = query.queries.map((v) => {


            if (!v.details) {
                return { ...v, details: v.details }
            }
            let ref: {
                call_back: string | undefined,
                where: string | undefined
            } = { call_back: undefined, where: undefined };


            if (v.details?.call_back) {
                ref.call_back = v.details?.call_back.toString()
            }
            if (v.details?.where) {
                ref.where = v.details?.where.toString()
            }

            return { query: v.query, details: { ...v.details, where: ref.where, call_back: ref.call_back } }
        })
        return { queries: r, records: query.records }
    }
    send_task<X extends worker_query<any> = worker_query<any>, Y extends any[] = any[]>(value: X, on_resolve: (data: Y) => void, transferList?: readonly Transferable[]): void {
        this.postMessage(this.process_queries(value), transferList)
        this.logs.push([States.GREEN, "Task sent to Worker " + this.threadId + this.threadName + JSON.stringify(value)])
        this.tasks.push(on_resolve)
    }
}



// we can give a user the option to impliment their own manage fn 
// worker ppol with default routing 

export class ManageTable<T> {
    #queries: (ManagerOptions<T>["queries"][0] & { readonly ref: number })[];
    #table: Table<T>;
    static #worker: TableWorker | undefined;

    static #workerPool: WorkerPool<worker_query<any>, any[]>

    interval: number


    readonly get_worker = () => {
        if (!ManageTable.#worker) {
            console.log("Worker was not initialized ")
            if (!WorkerPool.instance) {
                console.log(" and so was the worker pool ")
            } else {
                console.log(" only worker pool initialzes ")

            }

        }
        return ManageTable.#worker
    }

    /**
     * 
     * @param table to manage 
     * @param manager_options 
     * @param read_from file to load onto worker. once the  first instance of this object is created, that consumes the worker or workerpool , neither any other file can be loaded onto worker thread or any other worker PoolOPtion conigurations can be considered  by instanciating a new instace of `this` object 
     * @returns 
     */
    constructor(
        table: Table<T>,
        manager_options: ManagerOptions<T> = { queries: [], interval_between_snooze: 15000, on_this_thread: false, use_worker_pool: false },

        read_from: string = "./DatabaseTS/Manager.ts"
    ) {
        this.#table = table
        this.interval = (manager_options.interval_between_snooze || 15) * 1000
        this.#queries = manager_options.queries.flatMap((query) => this.format_query(query));

        if (!(manager_options.on_this_thread || ManageTable.#worker || WorkerPool.instance)) {
            if (manager_options.use_worker_pool == false) {
                ManageTable.#worker = new TableWorker(read_from)

                ManageTable.#worker.on("error", (err) => {
                    console.log("Error in worker. Table manager ", err)
                    ManageTable.#worker?.terminate().finally(() => {
                        ManageTable.#worker = new TableWorker(read_from)
                    })
                })
            } else {

                ManageTable.#workerPool = new WorkerPool<worker_query<T>, T[]>()
                ManageTable.#workerPool.init(read_from, manager_options.use_worker_pool.recovery_options?.recover_worker!)
            }

        }
        ManageTable.manage(manager_options.on_this_thread!, !!manager_options.use_worker_pool, this)
    }

    readonly format_query = (query: ManagerOptions<T>["queries"][0]): ManagerOptions<T>["queries"][0] & { readonly ref: number } => {
        let hold: number = Math.round(query.after * 1000 / this.interval)
        return { ...query, after: hold, ref: hold }
    }





    /**
     * pusshes a qury to the query queue
     * @param query to append to list of queries to be executed on the table 
     */
    readonly add_query = (query: ManagerOptions<T>["queries"][0]) => { this.#queries.push(this.format_query(query)) }

    private static manage<T>(on_this_thread: boolean, use_worker_pool: boolean, instance: ManageTable<T>) {

        let bundle: worker_query<T>;
        console.log("Query itt  many ")
        setInterval(() => {
            console.log("Query itt ", instance.#queries)
            bundle = { queries: [], records: undefined }
            instance.#queries.map((query) => {
                if (query.after != 0) {
                    query.after--
                    return query
                }
                bundle.queries.push({ query: query.query + " into " + instance.#table.get_name(), details: query.details })
                if (!query.always) {
                    instance.#queries = instance.#queries.filter((query_) => JSON.stringify(query) != JSON.stringify(query_))
                    return query
                } else {
                    query.after = query.ref
                    return query
                }
            })
            if (!bundle.queries.length) { return }

            console.log("Query tasks ", bundle)
            if (on_this_thread) {
                work<T>(bundle, instance.#table)
                return
            }
            bundle.records = [...instance.#table.clone()]

            let update = (data: T[]) => {
                instance.#table.wipe()
                instance.#table.absorb(data)

                // console.log(instance.#table.clone())
            }
            if (!use_worker_pool) {
                ManageTable.#worker?.send_task<typeof bundle, T[]>(bundle, update);
            } else {
                ManageTable.#workerPool.queue_task(bundle, update)
            }


            // }, instance.interval)
        }, 300)
    }


}



/**
 * two or none 
 */
