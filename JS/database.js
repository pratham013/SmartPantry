function loadIngredients() {
    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    let ingredientList = document.getElementById("ingredient-list");
    let expiringItems = document.getElementById("expiring-items");

    if (!ingredientList || !expiringItems) return;

    ingredientList.innerHTML = "";
    expiringItems.innerHTML = "";

    let today = new Date();
    let hasExpiringItems = false;

    storedIngredients.forEach((ingredient, index) => {
        let expirationDate = new Date(ingredient.expiration);
        let timeLeft = Math.floor((expirationDate - today) / (1000 * 60 * 60 * 24));

        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${ingredient.name}</td>
            <td>${ingredient.scanned ? "Barcode-Scanned" : "Manually Added"}</td>
            <td><input type="number" value="${ingredient.quantity}" onchange="updateQuantity(${index}, this.value)"></td>
            <td>${ingredient.expiration} (${timeLeft} days left)</td>
            <td><button class="btn btn-small btn-remove" onclick="removeIngredient(${index})">Remove</button></td>
        `;
        ingredientList.appendChild(row);

        // ✅ Only show manually added ingredients in "Expiring Soon" alerts
        if (!ingredient.scanned && timeLeft > 0 && timeLeft <= 3) {
            hasExpiringItems = true;
            let warning = document.createElement("div");
            warning.classList.add("expiring-warning");
            warning.innerHTML = `
                ⚠️ ${ingredient.name} expires in ${timeLeft} days!
                <button class="btn btn-small" onclick="suggestRecipes('${ingredient.name}')">Use Now</button>
            `;
            expiringItems.appendChild(warning);
        }
    });

    if (!hasExpiringItems) {
        expiringItems.innerHTML = `<p>No items expiring soon.</p>`;
    }

    updateFridgeCount();
}


// Suggest recipes based on an expiring ingredient
function suggestRecipes(ingredient) {
    alert(`Fetching recipes using ${ingredient}...`);
    window.location.href = `../HTML/recipes.html?ingredient=${ingredient}`;
}

// Remove ingredient from inventory and update fridge count
function removeIngredient(index) {
    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    storedIngredients.splice(index, 1);
    
    localStorage.setItem("ingredients", JSON.stringify(storedIngredients));
    loadIngredients();
    updateFridgeCount();
}

// Save new ingredients properly
function saveIngredient(name, quantity, expiration) {
    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    storedIngredients.push({ name, quantity, expiration });

    localStorage.setItem("ingredients", JSON.stringify(storedIngredients));
    loadIngredients();
    updateFridgeCount();
}

// Update quantity
function updateQuantity(index, value) {
    let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    ingredients[index].quantity = value;
    localStorage.setItem("ingredients", JSON.stringify(ingredients));
}

// Use ingredient (removes 1 from quantity)
function useIngredient(index) {
    let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    if (ingredients[index].quantity > 1) {
        ingredients[index].quantity -= 1;
    } else {
        ingredients.splice(index, 1); // Remove from list if quantity is 0
    }
    localStorage.setItem("ingredients", JSON.stringify(ingredients));
    loadIngredients();
    updateFridgeCount();
}

// Updates the fridge cart count dynamically
function updateFridgeCount() {
    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    let cartCountElement = document.getElementById("cart-count");

    if (cartCountElement) {
        cartCountElement.textContent = storedIngredients.length || 0;
        console.log("Updated fridge count:", storedIngredients.length);
    } else {
        console.warn("Warning: cart-count element not found. This is normal if not on the homepage.");
    }
}

// Ensure everything loads properly on page load
window.onload = function() {
    loadIngredients();
    updateFridgeCount(); // ✅ Now runs on page load
};

// Redirects to the recipes page
function goToRecipe() {
    window.location.href = "../HTML/recipes.html";
}

// Function to manually add an ingredient
function addManually() {
    let name = prompt("Enter the ingredient name:");
    if (!name) return;

    let category = prompt("Enter the ingredient category (e.g., Vegetable, Dairy, Meat):");
    let quantity = prompt("Enter quantity:");
    if (!quantity || isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    let expirationDays = prompt("How many days will this last? (Enter number)");
    if (!expirationDays || isNaN(expirationDays) || expirationDays <= 0) {
        alert("Please enter a valid number of days.");
        return;
    }

    let expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + parseInt(expirationDays));
    expirationDate = expirationDate.toISOString().split("T")[0]; // Convert to YYYY-MM-DD

    saveIngredient(name, quantity, expirationDate, category);
}

// Function to add more items (Redirects to Recognition Page)
function addMoreItems() {
    window.location.href = "../HTML/input.html";
}

// Function to save an ingredient
function saveIngredient(name, quantity, expiration, category = "Unknown") {
    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    storedIngredients.push({ name, quantity, expiration, category });

    localStorage.setItem("ingredients", JSON.stringify(storedIngredients));
    loadIngredients();
    updateFridgeCount();
}
