// string query 
/**
 * action , readability keyword , table  
 * 
 */
import { styleText } from "util"
export class Tokens {



    static tokenize(query_: string): { action: string, table: string } {
        let query: string[] = [...query_]
        query = this.construct(query);
        if (!["into", "from"].includes(query[1].toLowerCase())) {
            throw new Error(`Expected  readability modifier 'from' or 'into' instead saw ' ${query[1]}' at query '${query_}'`)
        }
        if (query.length > 4) {
            console.log(styleText("yellowBright", ` TOO MANY TOKENS IN QUERY --'${query_}  '
        ${styleText("underline", "Query Structure")}
        ' Action_key_word  readability_keyword(from/into) table_name ' 
          ^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^ 
            Yours 
            ${query_} 
            ${styleText("underline", `Excess tokens ${query.filter((_, idx) => idx > 3)}`)}
                `))

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
