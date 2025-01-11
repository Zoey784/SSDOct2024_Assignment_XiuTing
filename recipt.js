const sql = require("mssql");
const dbConfig = require("./dbConfig");

class Recipe {
    constructor(id, title, author) {
      this.id = id;
      this.title = title;
      this.author = author;
    }
  }
  
  module.exports = Recipe;