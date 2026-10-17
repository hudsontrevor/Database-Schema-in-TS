import { worker_query } from "./DBtypes";
import { TableWorker } from "./TableManager";

export class WorkerPool<Tasks extends worker_query<any>, Output extends any[]> {

    #workers: [TableWorker, TableWorker] | undefined;


    static instance: WorkerPool<any, any> | undefined;
    constructor() { }
    init(from: string = "../DatabaseTS/Manager.ts", on_worker_err: Promise<null>) {
        if (!WorkerPool.instance) {
            WorkerPool.instance = new WorkerPool()
            this.#workers = [
                new TableWorker(from),
                new TableWorker(from),
            ]
            this.manage_workers(from, on_worker_err)
        }
    }

    tasks: { data: Tasks, on_resolve: (data: Output) => void }[] = [];

    queue_task(task: Tasks, on_resolve: (data: Output) => void) {
        let assigned: boolean = false;
        this.#workers?.map((worker) => {
            if (!worker.is_busy && worker.is_up_and_running) {
                worker.is_busy = true
                assigned = true
                let tsk = task;
                worker.send_task<Tasks, Output>(tsk, (data) => {
                    on_resolve(data);
                    worker.is_busy = false
                })
            }
            return worker
        })

        if (!assigned) {
            this.tasks.push({
                data: task,
                on_resolve: on_resolve
            })
        }
    }





    // maybe one gives a function well wee 
    private manage_workers(work_path: string, on_worker_err: Promise<null>) {
        this.#workers?.map((tableworker) => {
            tableworker.on("message", () => {
                if (this.tasks.length > 0 && tableworker.is_up_and_running) {
                    let task = this.tasks.shift()
                    tableworker.send_task<Tasks, Output>(task?.data!, task?.on_resolve!)
                }
            })
                .on("error", (error) => {
                    console.log("Error in worker ---------------------- . ---> ", error, tableworker.logs);
                    tableworker.is_up_and_running = false;
                    tableworker.terminate()
                    on_worker_err.then(() => { tableworker = new TableWorker(work_path) })
                })

            return tableworker
        })


    }




}


