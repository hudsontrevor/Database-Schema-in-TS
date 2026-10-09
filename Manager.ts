import { parentPort } from "node:worker_threads"
import { Query } from "./QueryClient"
import { Table } from "./Table"
import { worker_query } from "./TableManager"




const blindQueryClient = new Query()
if (parentPort) {
    parentPort.on("message", <T>(queries: worker_query<T>) => {
        parentPort?.postMessage(work(queries))
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
        blindQueryClient.query_table<T>(qry.query, qry.details, table)
    })
    return table.select_all(() => true, () => true)
}

