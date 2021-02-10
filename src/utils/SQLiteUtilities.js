const sqlite3 = require('sqlite3').verbose();

databasePath = `${process.env.DATABASE_FILEPATH}`;


class SQLiteUtilities{

    /**
     * @returns Returns a connected DB object.
     */
    connectToDB(){
        return new sqlite3.Database(databasePath, (err) => {
            if (err) {
                printError(err)
            }
            //console.log('Connected to the chinook database.');
          });
    }

    /**
     * @description Closes the DB connection of the db object passed.
     * @param {Object} db The db object to close. 
     */
    closeConnection(db){
        db.close((err) => {
            if (err) {
                printError(err)
            }
            //console.log('Close the database connection.');
          });
    }

    /**
     * @param {String} tableName The name of the table.
     * @param {Array} data Array of the data to be added. The array should map out to the columns.
     */
    insertData(tableName, data){
        
        //open the DB connection.
        let db = this.connectToDB();


        let questionmarks = '?,'.repeat(data.length);
        const sql = `INSERT INTO ${tableName} VALUES(${questionmarks.substring(0, questionmarks.length - 1)})`;

        //run the command
        runCommand(db, sql, data)
        
        //close the DB connection.
        this.closeConnection(db);
    }

    /**
     * 
     * @param {String} tableName The name of the table.
     * @param {JSON} data An object that maps the column names to the values. {columnName: value}
     * @param {JSON} query An object that contains the query and the query value. {query: string, values: [ ]} 
     */
    updateData(tableName, data, query){
        //map the data out to the query
        const sql = `Update ${tableName} SET ` + Object.keys(data).map(key => `${key} = ?`).join(", ") + ` WHERE ${query.query}`;
        //map the values out
        const parameters = [...Object.values(data), ...Object.values(query.values)];

        //open the DB connection.
        let db = this.connectToDB();

        //run the command
        runCommand(db, sql, parameters)

        //close the DB connection.
        this.closeConnection(db);
    }

    /**
     * 
     * @param {String} tableName The name of the table.
     * @param {JSON} query An object that contains the query and the query value. {query: string, values: [ ]} 
     */
    deleteData(tableName, query){
        //create the SQL
        const sql = `DELETE FROM ${tableName} WHERE ${query.query}`;
        //map the values out
        const parameters = [...Object.values(query.values)];

        //open the DB connection.
        let db = this.connectToDB();

        //run the command
        runCommand(db, sql, parameters)

        //close the DB connection.
        this.closeConnection(db);
    }

    /**
     * 
     * @param {JSON} columns A JSON object that describes the columns to grab the data from and the name in the returned object. {columnName: returnName}
     * @param {String} tableName The name of the table.
     * @param {JSON} query An object that contains the query and the query value. {query: string, values: [ ]} 
     */
    async getDataSingle(columns, tableName, query){
        //create the columns for the SELECT
        let columnArray = Object.entries(columns);
        let selectText = '';
        if(columnArray.length > 1){
            columnArray.forEach(element => {
                selectText += `, ${element[0]} ${element[1]}`;
            });
        }else{
            selectText = `,${columnArray[0][0]} ${columnArray[0][1]}`;
        }

        //remove the first comma (,)
        selectText = selectText.substring(2);

        //make the SQL query
        const sql = `SELECT ${selectText} FROM ${tableName} WHERE ${query.query}`
        //const sql = `SELECT serverID id FROM Roles WHERE serverID = ?`

        //map the values out
        const parameters = [...Object.values(query.values)];

        //open the DB connection.
        let db = this.connectToDB();

        //run the command
        /* let promise = new Promise((resolve, reject) =>{
            let result = getCommand(db, sql, parameters)
            if(result) resolve(result)
            else reject(null)
        }) */
        let result = await getCommand(db, sql, parameters)
        

        //close the DB connection.
        this.closeConnection(db);

        return result
    }
}


/**
 * @description Returns ALL rows and places the on memory. 
 */
function getCommand(db, sql){
    return new Promise((resolve,reject) => {
        db.all(sql, data, (err, rows) => {
            if (err) {
              printError(err);
              reject(err);
            }
            resolve(rows);
        });
    });
    
}

/**
 * @description Only returns the first result of the query. 
 */
function getCommand(db, sql, data){
    return new Promise((resolve,reject) => {
        db.get(sql, data, (err, row) => {
            if (err) {
              printError(err);
              reject(err);
            }
            resolve(row);
        });
    });
    
}

function runCommand(db, sql, data){
    db.run(sql, data, function(err) {
        if (err) {
          return printError(err);
        }
        // get the last insert id
        //console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
}

function printError(err){
    console.log(new Date(), err.message);
}

module.exports = new SQLiteUtilities();