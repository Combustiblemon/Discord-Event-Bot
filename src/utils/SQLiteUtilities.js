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
        console.log(questionmarks);
        //insert the data
        db.run(`INSERT INTO ${tableName} VALUES(${questionmarks.substring(0, questionmarks.length - 1)})`, data, function(err) {
            if (err) {
              return printError(err);
            }
            // get the last insert id
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
        
        //close the DB connection.
        this.closeConnection(db);
    }
}

function printError(err){
    console.log(new Date(), err.message);
}

module.exports = new SQLiteUtilities();