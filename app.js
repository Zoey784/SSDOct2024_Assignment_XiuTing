const express = require("express");
const recipeController = require("./controllers/recipeController");
const userController = require('./controllers/userController');
const authenticateJWT = require('./middleware/authMiddleware');
const sql = require("mssql");
const dbConfig = require("./dbConfig");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (No authentication required)
app.post('/user', userController.createUser); // Register new user
app.post('/user/login', userController.loginUser); // Login user

// Protected routes (Authentication required)
app.get("/recipe", authenticateJWT, recipeController.getAllRecipe); // For user and admin to see recipe
app.get("/recipe/:id", authenticateJWT, recipeController.getRecipeById); // For user and admin to see 1 recipe
app.post("/recipe", authenticateJWT, recipeController.createRecipe); // Only Admin can create
//app.post("/recipe/:recipeId/favorite", authenticateJWT, recipeController.favoriteRecipe);
app.delete("/recipe/:id", authenticateJWT, recipeController.deleteRecipe); // Only Admin can delete recipe

// User routes
app.get('/user', authenticateJWT, userController.getAllUsers); //If user is not admin they only can see their own ID. If user id admin it will show all
app.get('/user/:id', authenticateJWT, userController.getUserById); // Only can select user by ID
app.put('/user/:id', authenticateJWT, userController.updateUser); // User can update they own details. Admin can update everyone
app.delete('/user/:id', authenticateJWT, userController.deleteUser); // User can delete they own credential. Admin can delete everyone

app.post("/recipe/:id/favorite", authenticateJWT, recipeController.getRecipeWithFavourite);
//app.get("/recipe/favorites", authenticateJWT, recipeController.getUserFavorites);
//app.get("/admin/favorites", authenticateJWT, recipeController.getAllFavorites);

//app.get("/user/:id/favorites", authenticateJWT, recipeController.getUserFavorites);

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

process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    await sql.close();
    console.log("Database connection closed");
    process.exit(0);
});