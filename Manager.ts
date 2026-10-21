import { parentPort } from "node:worker_threads"
import { Query } from "./QueryClient"
import { Table } from "./Table"
import { hold, query_, query_simple, worker_query } from "./DBtypes"
import { styleText } from "node:util"








const blindQueryClient = new Query()
if (parentPort) {
    parentPort.on("message", <T>(queries: hold<T>) => {
        console.log(
            styleText("bgCyanBright", ` ---------------------------------- CVVFSGGGS ${queries.queries}`),
            queries.queries
        )
        parentPort?.postMessage(work(procces_tasks(queries)))
    })

}


export const work = <T>(queries: worker_query<T>, table_?: Table<T>): T[] => {
    let table: Table<T>;
    if (table_) {
        table = table_
    } else {
        table = new Table<T>("")
        table.absorb(queries.records!)
    }
    queries.queries.forEach((qry) => {
        blindQueryClient.query_table<T, any>(qry.query, qry.details, table)
    })
    return table.clone()
}


function procces_tasks<T>(queries: hold<T>): worker_query<T> {
    return {
        records: queries.records, queries: [...queries.queries].flatMap((query) => {
            let details: query_<T>["details"] = {
                call_back: undefined,
                where: undefined,
            }
            if (query.details?.call_back) {
                details.call_back = (new Function(` return ${query.details.call_back} `))() as (...args: any[]) => any
            }
            if (query.details?.where) {
                details.where = (new Function(` return ${query.details.where} `))() as (...args: any[]) => any
            }
            return { query: query.query, details: { ...query, where: details.where, call_back: details.call_back } }
        })
    }

}


// let r = procces_tasks({
//     queries: [
//         { details: { where: "()=>true" }, query: "Selec" }
//     ], records: []
// })


// console.log((r.queries[0].details?.where as (args: any) => any)!("rada"))