// string query 
/**
 * action , readability keyword , table  
 * 
 */

import { Queries } from "./DbQueries";
import { query } from "./DBtypes";

export class Tokens {



    static tokenize(query_: string): { action: string, table: string } {
        let query: string[] = [...query_]
        query = this.construct(query);
        if (!["into", "from"].includes(query[1].toLowerCase())) {
            throw new Error(`Expected  readability modifier 'from' or 'into' instead saw '${query[1]}' at query '${query_}'`)
        }
        return { action: query[0], table: query[2] }
    }




    static construct(c: string[]): string[] {
        let words: string[] = []
        let word: string = "";
        for (let i = 0; i < c.length; i++) {
            if (c[i] == " ") {
                if (!word) { continue }
                words.push(word)
                word = ""
                continue
            } word += c[i]
        }





        return words



    }






}
