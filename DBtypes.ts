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