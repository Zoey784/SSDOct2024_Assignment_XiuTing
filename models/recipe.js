const sql = require("mssql");
const dbConfig = require("../dbConfig");

class Recipe {
  constructor(id, user_id, title, description, cooking_time, total_time, prep_time, difficulty_level, created_at) {
    this.id = id;
    this.user_id = user_id;
    this.title = title;
    this.description = description;
    this.cooking_time = cooking_time;
    this.total_time = total_time;
    this.prep_time = prep_time;
    this.difficulty_level = difficulty_level;
    this.created_at = created_at;
  }

  static async getAllRecipe(){
    const connection = await sql.connect(dbConfig);

    const sqlQuery = "SELECT * FROM Recipe";

    const request = connection.request();
    const result = await request.query(sqlQuery);

    connection.close();
    
    return result.recordset.map(
      (row) => new Recipe(row.id, row.user_id, row.title, row.description, row.cooking_time, row.total_time, row.prep_time, row.difficulty_level, row.created_at)
    );
  }

  static async getRecipeById(id){
    const connection = await sql.connect(dbConfig);

    const sqlQuery = "SELECT * FROM Recipe WHERE id = @id";

    const request = connection.request();
    request.input("id", id);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset[0]
    ? new Recipe(
      result.recordset[0].id,
      result.recordset[0].user_id,
      result.recordset[0].title,
      result.recordset[0].description,
      result.recordset[0].cooking_time,
      result.recordset[0].total_time,
      result.recordset[0].prep_time,
      result.recordset[0].difficulty_level,
      result.recordset[0].created_at
    )
    : null;
  }

  static async createRecipe(newRecipeData) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `INSERT INTO Recipe (user_id, title, description, cooking_time, total_time, prep_time, difficulty_level) 
                      VALUES(@user_id, @title, @description, @cooking_time, @total_time, @prep_time, @difficulty_level); 
                      SELECT SCOPE_IDENTITY() AS id;`;

    const request = connection.request();
    request.input("user_id", newRecipeData.user_id);
    request.input("title", newRecipeData.title);
    request.input("description", newRecipeData.description);
    request.input("cooking_time", newRecipeData.cooking_time);
    request.input("total_time", newRecipeData.total_time);
    request.input("prep_time", newRecipeData.prep_time);
    request.input("difficulty_level", newRecipeData.difficulty_level);

    const result = await request.query(sqlQuery);
    connection.close();

    return { id: result.recordset[0].id, ...newRecipeData };
}


  static async updateRecipe(id, newRecipeData){
    const connection = await sql.connect(dbConfig);

    const sqlQuery = "UPDATE Recipe SET title=@title, description=@description, cooking_time=@cooking_time, total_time=@total_time, prep_time=@prep_time, difficulty_level=@difficulty_level WHERE id=@id";

    const request = connection.request();
    request.input("id", id);
    request.input("title", newRecipeData.title || null);
    request.input("description", newRecipeData.description || null);
    request.input("cooking_time", newRecipeData.cooking_time || null);
    request.input("total_time", newRecipeData.total_time || null);
    request.input("prep_time", newRecipeData.prep_time || null);
    request.input("difficulty_level", newRecipeData.difficulty_level || null);

    await request.query(sqlQuery);

    connection.close();

    return this.getRecipeById(id);
  }

  static async deleteRecipe(id){
    const connection = await sql.connect(dbConfig);

    const sqlQuery = "DELETE FROM Recipe WHERE id=@id";

    const request = connection.request();
    request.input("id", id);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.rowsAffected > 0;
  }

//   static async favoriteRecipe(userId, recipeId) {
//     const connection = await sql.connect(dbConfig);
//     const sqlQuery = `INSERT INTO Favorites (user_id, recipe_id) VALUES (@userId, @recipeId)`;
//     const request = connection.request();
//     request.input("userId", userId);
//     request.input("recipeId", recipeId);
//     await request.query(sqlQuery);
//     connection.close();
//     return { message: "Recipe favorited successfully" };
// }

static async favoriteRecipe(userId, recipeId) {
  try {
      const connection = await sql.connect(dbConfig);
      const sqlQuery = `INSERT INTO Favorites (user_id, recipe_id) VALUES (@userId, @recipeId)`;
      const request = connection.request();
      request.input("userId", userId);
      request.input("recipeId", recipeId);
      await request.query(sqlQuery);
      connection.close();
      return { message: "Recipe favorited successfully" };
  } catch (error) {
      console.error("Error favoriting recipe:", error);
      throw new Error("Error executing query in favoriteRecipe");
  }
}





static async getUserFavorites(userId) {
    const connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT r.* FROM Recipe r INNER JOIN Favorites f ON r.id = f.recipe_id WHERE f.user_id = @userId`;
    const request = connection.request();
    request.input("userId", userId);
    const result = await request.query(sqlQuery);
    connection.close();
    return result.recordset;
}

static async getAllFavorites() {
    const connection = await sql.connect(dbConfig);
    const sqlQuery = `SELECT u.username, r.title FROM Favorites f JOIN Users u ON f.user_id = u.id JOIN Recipe r ON f.recipe_id = r.id`;
    const request = connection.request();
    const result = await request.query(sqlQuery);
    connection.close();
    return result.recordset;
}

}

module.exports = Recipe;