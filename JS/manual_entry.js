document.getElementById("manual-entry-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form reload

    let name = document.getElementById("ingredient-name").value.trim();
    let quantity = document.getElementById("quantity").value;
    let category = document.getElementById("category").value;
    let storage = document.getElementById("storage").value;
    let expiration = document.getElementById("expiration").value;

    if (name === "" || quantity <= 0 || expiration === "") {
        alert("Please enter valid ingredient details.");
        return;
    }

    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    
    // Store the new ingredient
    storedIngredients.push({
        name: name,
        quantity: quantity,
        category: category,
        storage: storage,
        expiration: expiration,
        calories: "N/A" // No calorie data for manual entry
    });

    localStorage.setItem("ingredients", JSON.stringify(storedIngredients));
    alert(`${name} has been added!`);

    // Redirect to database
    window.location.href = "../HTML/database.html";
});

// Redirect to database
function goToDatabase() {
    window.location.href = "../HTML/database.html";
}
