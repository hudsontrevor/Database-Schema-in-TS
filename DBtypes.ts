import { Queries } from "./DbQueries";
import { Table } from "./Table";



export type query<T> = [Queries, string, {
    /**
     * executes a callback to each item in store returning those where call_back evaluates to true 
     * used in select_* , delete , insert_* and update statement 
     * @param record each individual record in store 
     * @returns 
     */
    where?: (record: T) => boolean,
    /**
     * record to add in insert and the set statements 
    */
    record?: T,
    /**
     *  records to add in absorb statement 
     */
    records?: T[],

    /**
     * parent from which to inherit records 
     */
    parent?: Table<T>,

    /**
     * A call back to records, used in itterations like in select_all , update_all and update_once 
     * @param record to act upon 
     */

    call_back?: (record: T) => boolean | any
}]



export type query_<T> = {
    query: string,
    details?: query<T>[2],
}

export type worker_query<T> = {
    queries: {
        /**
         * query to execute see `Queries`
         */
        query: string,
        /**
         * details of the query 
         */
        details?: query<T>[2],
    }[],
    /**
     * a holder for records in table 
     */
    records?: T[]
}

export interface ManagerOptions<T> {
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
     *  wether to run query evaluations on this thread or spin up a worker if false. defaulf `false`
     */
    on_this_thread?: boolean
}
