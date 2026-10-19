import { Clock } from "./Clock";


type OberverEvent = { event_: GaugeEvent, call: () => any }

export class Observer {

    #is_init: boolean = false
    is_init = () => this.#is_init
    #requests: number = 0;

    log_request = (): number => {
        this.#is_init = true;
        this.#requests++;
        return this.#requests
    }

    rate: number = 0
    #rates: number[] = []


    clock = new Clock<OberverEvent>(
        // time in seconds 
        60,
        undefined,
        (records) => {
            // rate for the past one minute 
            this.rate = this.#requests / 60
            this.#requests = 0;
            this.#rates.push(this.rate)
            let events_ = this.listen_for_gauge_events()
            records.forEach((v) => {
                if (events_.includes(v.event_)) {
                    v.call()
                }
            })
        },
    )



    #deviation: number = 1;

    constructor(deviation?: number) {
        if (deviation) {
            this.#deviation = deviation
        }
    }


    get_stats(): Stats {
        let requests = 0
        this.#rates.forEach((v) => {
            requests += v * 60
        })
        return {
            average_rate: this.Math.average(this.#rates).toString() + "requests/s",
            lowest: Math.min(...this.#rates).toString() + "requests/s",
            no_of_requests: this.Math.sum(this.#rates.map((v) => v * 60)),
            peak: Math.min(...this.#rates).toString() + "requests/s"
        }


    }




    //  listen for gauge =Events 
    listen_for_gauge_events(): GaugeEvent[] {

        let gauge_events: GaugeEvent[] = [];

        if (Math.max(...this.#rates) == this.rate) {
            gauge_events.push("ON_HIGHEST_RATE")
        } else if (Math.min(...this.#rates) == this.rate) {
            gauge_events.push("ON_LOWEST_RATE")
        }

        if (this.on_rate && this.within_deviation(this.on_rate, this.rate)) {
            gauge_events.push("ON_RATE")
        }



        if (this.within_deviation(this.rate, this.Math.Q2(this.#rates))) {
            gauge_events.push("Q2")
        } else if (this.within_deviation(this.rate, this.Math.Q1_Q3(this.#rates).Q1)) {
            gauge_events.push("Q1")
        } else if (this.within_deviation(this.rate, this.Math.Q1_Q3(this.#rates).Q3)) {
            gauge_events.push("Q3")
        }
        return gauge_events
    }

    within_deviation = (num: number, rng: number): boolean => num < rng + this.#deviation && num > rng + this.#deviation






    once(GaugeEvent: GaugeEvent, execute: () => any, rate?: number): this {
        if (GaugeEvent == "ON_RATE") { this.on_rate = rate }
        this.clock.add_to_queue({
            after: this.clock.INTERVAL(), always: false, records: {
                event_: GaugeEvent, call: () => {
                    execute();
                    this.clock.queue = this.clock.queue.filter((v) => `${v.records.call.toString()}${v.records.event_}` != `${execute.toString()}${GaugeEvent}`)
                }
            }
        })
        return this
    }
    on_rate: number | undefined
    on(GaugeEvent: GaugeEvent, execute: () => any, rate?: number): this {
        if (GaugeEvent == "ON_RATE") { this.on_rate = rate }
        this.clock.add_to_queue({ after: this.clock.INTERVAL(), always: false, records: { event_: GaugeEvent, call: execute } })
        return this

    }

    Math = new class {

        sum(args: number[]): number {
            let sum: number = 0
            args.forEach((v) => { sum += v })
            return sum
        }
        average = (args: number[]) => this.sum(args) / args.length

        split_2(args: number[]) {
            let _args = args.sort();
            let at = (_args.length & 1) == 1 ? Math.trunc(_args.length / 2) + 1 : args.length / 2
            return [_args.slice(0, at), _args.slice(at, _args.length)] as const
        }



        // quartiles 

        Q2 = (args: number[]): number => {
            let hold = this.split_2(args);
            if (hold[0].length == hold[1].length) {
                return (hold[0].find((_, i, obj) => i == (obj.length - 1))! + hold[1][0]) / 2
            }
            return hold[0].find((_, i, obj) => i == obj.length - 1)!
        }

        Q1_Q3 = (args: number[]): { "Q1": number, "Q3": number } => {
            let hold = this.split_2(args)
            return {
                Q1: this.Q2(hold[0].length != hold[1].length ? hold[0].slice(0, -1) : hold[0]),
                Q3: this.Q2(hold[1])
            }
        }

    }

}



type GaugeEvent = "Q1" | "Q2" | "Q3" | "ON_LOWEST_RATE" | "ON_HIGHEST_RATE" | "ON_RATE"


type Stats = {
    no_of_requests: number
    average_rate: string
    peak: string
    lowest: string
}




// function split_2(args: number[]) {
//     let _args = args.sort();
//     let at = (_args.length & 1) == 1 ? Math.trunc(_args.length / 2) + 1 : args.length / 2

//     return [_args.slice(0, at), _args.slice(at, _args.length)]
// }

// const Q2 = (args: number[]): number => {
//     let hold = split_2(args);

//     // console.log((hold[0].find((_, i, obj) => i == obj.length - 1)! + hold[1].find((_, i, obj) => i == obj.length - 1)!) / 2, "jdjdj", hold)

//     if (hold[0].length == hold[1].length) {
//         console.log("HIERACHY")
//         return (hold[0].find((_, i, obj) => i == (obj.length - 1))! + hold[1][0]) / 2
//     }
//     return hold[0].find((_, i, obj) => i == obj.length - 1)!
// }


// let Q1_Q3 = (args: number[]): { "Q1": number, "Q3": number } => {
//     let hold = split_2(args)
//     return {
//         Q1: Q2(hold[0].length != hold[1].length ? hold[0].slice(0, hold[0].length) : hold[0]),
//         Q3: Q2(hold[1])
//     }
// }

// console.log(
//     split_2([1, 2, 4, 5, 6, 7, 8, 9, 0, 9, 8, 7, 7, 6, 5, 4, 3]),
//     Q2([1, 2, 4, 5, 6, 7, 8, 9, 0, 9, 8, 7, 7, 6, 5, 4, 3]),

//     Q1_Q3([1, 2, 3, 4, 5, 6]),
//     Q2([0, 1, 2, 3, 4, 5, 6]),
//     Q2([0, 1, 2])
// )


