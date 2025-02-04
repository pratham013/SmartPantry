const API_KEY = "c307905769564b2f81cac0bc17aef987";  // Replace with your Spoonacular API Key

async function fetchRecipes(expiringIngredient = "") {
    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];

    // ✅ Exclude barcode-scanned items
    let ingredientNames = storedIngredients
        .filter(item => !item.scanned) // Ignore scanned items
        .map(item => item.name)
        .join(",");

    // ✅ If no manually added ingredients exist, prevent API call
    if (!ingredientNames && !expiringIngredient) {
        alert("No manually added ingredients available for recipes.");
        return;
    }

    let diet = document.getElementById("diet-filter").value;
    let calorieFilter = document.getElementById("calorie-filter").value;
    let missingFilter = parseInt(document.getElementById("missing-filter").value) || null;
    let maxTime = document.getElementById("time-filter").value;
    let foodType = document.getElementById("food-type-filter").value;

    let dietQuery = diet ? `&diet=${diet}` : "";
    let timeQuery = maxTime ? `&maxReadyTime=${maxTime}` : "";
    let typeQuery = foodType ? `&type=${foodType}` : "";

    // ✅ If fetching based on expiring ingredients, override the ingredient list
    if (expiringIngredient) {
        ingredientNames = expiringIngredient;
    }

    let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${ingredientNames}&number=10&apiKey=${API_KEY}${dietQuery}${timeQuery}${typeQuery}&addRecipeInformation=true`;

    try {
        let response = await fetch(apiUrl);
        let data = await response.json();
        let recipes = data.results || [];

        // ✅ Apply filters after fetching recipes
        if (calorieFilter === "low") {
            recipes = recipes.filter(recipe => 
                recipe.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount < 400
            );
        }

        if (missingFilter) {
            recipes = recipes.filter(recipe => recipe.missedIngredientCount <= missingFilter);
        }

        displayRecipes(recipes);
    } catch (error) {
        console.error("❌ Error fetching recipes:", error);
    }
}

// Updates the fridge cart count dynamically
function updateFridgeCount() {
    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    let cartCountElement = document.getElementById("cart-count");

    if (cartCountElement) {
        cartCountElement.textContent = storedIngredients.length || 0;
        console.log("Updated fridge count:", storedIngredients.length);
    } else {
        console.warn("Warning: cart-count element not found in the Recipes Page.");
    }
}

// Prompt user if they want to generate recipes based on expiring items
function checkForExpiringIngredients() {
    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    let today = new Date();
    let soonToExpire = storedIngredients.filter(item => {
        let expirationDate = new Date(item.expiration);
        let timeLeft = Math.floor((expirationDate - today) / (1000 * 60 * 60 * 24)); // Days left
        return timeLeft > 0 && timeLeft <= 3; // Items expiring in 3 days
    });

    if (soonToExpire.length > 0) {
        let expiringIngredientNames = soonToExpire.map(item => item.name).join(", ");
        let userWantsRecipes = confirm(`The following items are expiring soon: ${expiringIngredientNames}. Would you like to generate recipes based on these items?`);

        if (userWantsRecipes) {
            fetchRecipes(expiringIngredientNames); // Fetch recipes based on expiring items
            return;
        }
    }
    
    fetchRecipes(); // If user says no, load recipes normally
}

// Display recipes in a card layout
function displayRecipes(recipes) {
    let recipesContainer = document.getElementById("recipes-container");
    recipesContainer.innerHTML = "";

    if (recipes.length === 0) {
        recipesContainer.innerHTML = "<p>No recipes found. Try adding more ingredients!</p>";
        return;
    }

    recipes.forEach(recipe => {
        let recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");
        recipeCard.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Source: ${recipe.sourceName || "Unknown"}</p>
            <p>Prep Time: ${recipe.readyInMinutes} mins</p>
            <button class="btn btn-details" onclick="viewRecipe(${recipe.id})">View Recipe</button>
        `;
        recipesContainer.appendChild(recipeCard);
    });
}

// Redirect to Spoonacular for full recipe details
async function viewRecipe(recipeId) {
    const detailsUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;

    try {
        let response = await fetch(detailsUrl);
        let recipeData = await response.json();

        if (recipeData.sourceUrl) {
            window.open(recipeData.sourceUrl, "_blank");
        } else {
            alert("Recipe details not found. Please try another recipe.");
        }
    } catch (error) {
        console.error("Error fetching recipe details:", error);
        alert("An error occurred while fetching the recipe details.");
    }
}

// Go back to the database
function goToDatabase() {
    window.location.href = "../HTML/database.html";
}

// Ensure fridge count updates when page loads
window.onload = function() {
    checkForExpiringIngredients();
    updateFridgeCount();
};
