import { worker_query, hold } from "../DBtypes";
import { Worker, Transferable } from "worker_threads";



interface WorkersInternalState {
    is_busy: boolean,
    is_up_and_running: boolean
    logs: [States, any][]
}

export enum States {
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
