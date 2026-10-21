

export enum Queries {

     /**
      * removes  all records that meet the criteria provided 
      * @param where a call back which returns true or false to either remove the element  or not  respectively 
      * @returns  whether an item was deleted 
      */
     DELETE = "DELETE",


     /**
      * allows the table to take records from a parent table 
      * @param parent table to take from 
      * @returns the current instance of the table 
      */
     INHERIT = "INHERIT",

     /**
      * Adds a record to the table 
      * @param record record to add 
      * @returns record added 
      */
     INSERT = "INSERT",


     /**
      * Adds a record if every  existing record meets the criteria provided
      * @param record record to add 
      * @param where call back to all elements that returns a bool to gauge criteria for selection if every  element holds up to the creteria 
      * @returns a boolean indicating whether the item was added
      */
     INSERT_IF_EVERY = "INSERT_IF_EVERY",

     /**
      * Adds a record if some existing records meet the criteria provided
      * @param record record to add 
      * @param evaluate call back to all elements that returns a bool to gauge criteria for selection if some elements hold up to the creteria 
      * @returns a boolean indicating whether the item was added
      */
     INSERT_IF_SOME = "INSERT_IF_SOME",

     /**
          * Selects all element by the criteria 
          * @param evalate a call back to elements to specify your criteria 
          * @returns `elements[]` metting the criteria 
          */
     SELECT_ALL = "SELECT_ALL",

     /**
      * updates the first occurence 
      * @param callback on all items/records that return a bool value signalling halting of further itteration if true 
      * @returns  true if modification occured  else false 
      */
     SELECT_ONCE = "SELECT_ONCE",


     /**
      * adds an element if no other element present matches its signature - compares in stringified form. for detailed comparison use `add_if_every`
      * @param record record to add
      * @returns  a boolean indicating whether the item was added
      */
     SET = "SET",

     /**
          * updates all elements 
          * @param call_back a call back to execute on all items . Return a boolean value indicating whether modification occured 
          * @returns true if modification occured 
          */
     UPDATE_ALL = "UPDATE_ALL",
     /**
          * updates the first occurence 
          * @param callback on all items/records that return a bool value signalling halting of further itteration if true 
          * @returns  true if modification occured  else false 
          */
     UPDATE_ONCE = "UPDATE_ONCE",
     /**
         * clears the table -- retaining the table name 
         */
     WIPE = "WIPE",
     /**
      * Adds a list of records to the table 
      * @param records to add 
      */
     ABSORB = "ABSORB",

}