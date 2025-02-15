const Recipe = require("../models/recipe");

const getAllRecipe = async (req, res) => {
    try {
      const recipe = await Recipe.getAllRecipe();
      res.json(recipe);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving Recipe");
    }
  };

  const getRecipeById = async (req, res) => {
    const recipeId = parseInt(req.params.id);
    try {
      const recipe = await Recipe.getRecipeById(recipeId);
      if (!recipe) {
        return res.status(404).send("Recipe not found");
      }
      res.json(recipe);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error retrieving Recipe");
    }
  };
  

  const createRecipe = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can create recipes" });
    }

    const newRecipe = req.body;
    try {
        const createdRecipe = await Recipe.createRecipe(newRecipe);
        res.status(201).json(createdRecipe);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating Recipe");
    }
};


const updateRecipe = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can update recipes" });
}

  const recipeId = parseInt(req.params.id);
  const newRecipeData = req.body;

  try {
    const updatedRecipe = await Recipe.updateRecipe(recipeId, newRecipeData);
    if (!updatedRecipe) {
      return res.status(404).send("Recipe not found");
    }
    res.json(updatedRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating Recipe");
  }
};

const deleteRecipe = async (req, res) => {
  // Check if the user is an admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Only admins can delete recipes" });
  }

  const recipeId = parseInt(req.params.id);

  try {
    const success = await Recipe.deleteRecipe(recipeId);
    if (!success) {
      return res.status(404).send("Recipe not found");
    }
    res.status(204).send(); // No content after successful deletion
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting Recipe");
  }
};


const favoriteRecipe = async (req, res) => {
  const { recipeId } = req.params;
  const userId = req.user.id; // Ensure this is set correctly by the auth middleware

  try {
      const success = await Recipe.favoriteRecipe(userId, recipeId);
      if (!success) {
          return res.status(400).json({ message: "Unable to favorite recipe" });
      }
      res.status(200).json({ message: "Recipe favorited successfully" });
  } catch (error) {
      console.error("Error favoriting recipe:", error);
      res.status(500).send("Error favoriting recipe");
  }
};



const getRecipeWithFavourite = async (req, res) => {
  try {
    const recipeId = parseInt(req.params.id);
    const userId = req.user.id;
    const result = await Recipe.favoriteRecipe(userId, recipeId);
    res.status(200).json(result);
} catch (error) {
    console.error(error);
    res.status(500).send("Error favoriting Recipe");
}
};

// const getUserFavorites = async (req, res) => {
//   const userId = req.user.id;
  
//   try {
//       const favorites = await Recipe.getUserFavorites(userId);
//       res.json(favorites);
//   } catch (error) {
//       console.error("Error retrieving user's favorite recipes:", error);
//       res.status(500).send("Error retrieving favorite recipes");
//   }
// };

const getUserFavorites = async (req, res) => {
  try {
      // Assuming the user ID is available in the request after authentication
      const userId = req.user.id;

      // Fetch the user's favorite recipes based on their userId
      const favorites = await Recipe.getFavoritesByUserId(userId);

      if (!favorites) {
          return res.status(404).json({ message: "No favorites found for this user." });
      }

      return res.status(200).json({ message: "Favorites retrieved successfully", favorites });
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error", error: err.message });
  }
};


const getAllFavorites = async (req, res) => {
  if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins can view favorites." });
  }

  try {
      const favorites = await Recipe.getAllFavorites();
      res.json(favorites);
  } catch (error) {
      console.error("Error retrieving all favorites:", error);
      res.status(500).send("Error retrieving favorite recipes");
  }
};

module.exports = {
  getAllRecipe,
  createRecipe,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  favoriteRecipe,
  getRecipeWithFavourite,
  getUserFavorites,
  getAllFavorites
};