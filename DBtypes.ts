import { Queries } from "./DbQueries";
import { Table } from "./Table";


export type hold<T> = {
    queries: {
        query: string,
        details?: query_simple<T>
    }[],
    records?: T[]
}


export type query<T> = [Queries, string, {
    /**
     * executes a callback fn  to each item in store qualifying each for a particullar query.  
     * used in select_* , delete , insert_* and update statements 
     * @param record each individual record in store 
     * @param index of record 
     * @param table list of all records in array 
     * @returns 
     */
    where?: (record: T, index: number, table: T[]) => boolean,
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
    queries: ({
        /**
         * details to the query 
         */
        details: query_<T>["details"],

        // Table manager has ref to table thus will fil in extra values 
        /**
         *Standard Queries for Table manager 
         */
        query: Queries
        /**
         *  after how long to execute this query in seconds `rounded of to the nearest interval_between_snooze` that is `Math.round(after/interval_between_snooze)`
         */
        after: number
        /**
         * wether to execute this query indefinetly. if `always` is set to true  `after` becomes the interval of execution of the query. if set to false, after is the countdown to query execution after which it is removed from the query pool 
         */
        always: boolean
    })[],
    /**
     * interval that gauges how often query evaluations should be made in seconds 
     */
    interval_between_snooze?: number,
    /**
     *  wether to run query evaluations on this thread or spin up a worker if false. defaulf `false`
     */
    on_this_thread?: boolean,

    use_worker_pool: false | PoolOPtions







}




type PoolOPtions = {


    recovery_options?: {

        /**
         * let the table manager  gauge when traffic is low to reboot a worker 
         */
        auto_recovery: false,
        recover_worker?: Promise<null>
    }
}

export type query_simple<T> = {
    /**
     * executes a callback fn  to each item in store qualifying each for a particullar query.  
     * used in select_* , delete , insert_* and update statements 
     * @param record each individual record in store 
     * @param index of record 
     * @param table list of all records in array 
     * @returns 
     */
    where?: string,
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

    call_back?: string
}
