import { Database } from "./DbSchema";
import { Query } from "./QueryClient";




// create database 
const Db: Database = new Database("ChessDb")



type struct = {
    name: string,
    id: number,
    DOB: string,
    id_no: string
}
// create a table under db  with name Msupa 
let table = Db.declare_table<struct>("Msupa")


table.add_record({
    DOB: "20_000_000",
    id: 231,
    id_no: "2udhale89",
    name: "Msupa 2 "
})
table.add_record({
    DOB: "20_000_000",
    id: 231,
    id_no: "2udhalfrg ",
    name: "Msupa 3 "
})


const Query_Client = new Query(Db);


// query table ,  table_name  ,  and assert type 
Query_Client.query_table<struct, struct>("select_once from " +
    // Table name 
    "Msupa", {
    where(record, index, table) {

        return record.name == "Msupa 3 "
    },
})





