const express = require("express");
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = 3000;

app.listen(port, async () => {
    try {
          await sql.connect(dbConfig);
          console.log("Database connection established successfully");
        } catch (err) {
          console.error("Database connection error:", err);
          process.exit(1);
        }
      
        console.log(`Server listening on port ${port}`);
  });