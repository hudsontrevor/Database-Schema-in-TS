

// cant really explain what this does just that ive used it alot 




/**
 * Creates a node.js timer that gaugues when and/or how frequently  evaluations should be made to queued records 
 */
export class Clock<T> {

    queue: ClockRecords<T>[] = []

    #timer: NodeJS.Timeout
    /**
     * 
     * @param intervale interval between evaluations in secodnds 
     * @param evaluate  call_back to execute on records when due 
     * @param mandatory function to execute on each timer run 
     */

    #interval: number;
    INTERVAL = () => this.#interval
    constructor(intervale: number, evaluate?: (record: T) => void, mandatory?: (records: T[]) => void, bundle?: boolean, with_bundle?: (records: T[]) => void) {
        this.#interval = intervale
        let bundle_: T[];
        this.#timer = setInterval(() => {
            bundle_ = []
            if (mandatory) {
                mandatory(this.queue.flatMap(({ records }) => records))
            }
            if (!evaluate && !with_bundle) {
                return
            }
            this.queue.map((record) => {
                if (record.after != 0) {
                    record.after--;
                    return record
                }
                if (evaluate) {
                    evaluate(record.records)
                }
                if (bundle) {
                    bundle_.push(record.records)
                }
                if (record.always) {
                    record.after = record.ref
                } else {
                    this.queue = this.queue.filter((v) => JSON.stringify(v) != JSON.stringify(record))
                }
                return record
            })
            if (with_bundle) {
                with_bundle(bundle_)
            }
        }, intervale * 1000);
    }


    /**
     * `NOTE `: the  field `after` is taken as the time in seconds after which to execute the query 
     * @param task task to add to queu
     * 
     * @returns 
     */
    add_to_queue = (task: Omit<ClockRecords<T>, "ref">) => {
        let hold = Math.round(task.after / this.#interval)
        this.queue.push({ ...task, after: hold, ref: hold })
    }

    end = () => this.#timer.close()
}



type ClockRecords<T> = {
    records: T
    after: number,
    always: boolean,
    readonly ref: number,
}


// let clock: Clock<{ id: string, name: string }> = new Clock(3, (record) => {
//     console.log(record)
// })

// clock.add_to_queue({
//     after: 5,
//     always: true,
//     records: {
//         id: "name ",
//         name: "idi "
//     }
// })