// Redirect to the ingredient recognition page
function startCooking() {
    window.location.href = "HTML/input.html";
}

// Redirect to the inventory database page
function goToDatabase() {
    window.location.href = "HTML/database.html";
}

// Updates the fridge cart count dynamically
function updateFridgeCount() {
    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    let cartCountElement = document.getElementById("cart-count");

    // Ensure the cart-count element exists before updating
    if (cartCountElement) {
        cartCountElement.textContent = storedIngredients.length || 0;
        console.log("Updated fridge count:", storedIngredients.length);
    } else {
        console.error("cart-count element not found in the DOM.");
    }
}

function checkExpiringItems() {
    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    let today = new Date();
    let expiringCount = 0;
    let expiredCount = 0;
    let expiringItems = [];
    let expiredItems = [];

    storedIngredients.forEach(item => {
        let expirationDate = new Date(item.expiration);
        let timeLeft = Math.floor((expirationDate - today) / (1000 * 60 * 60 * 24));

        if (timeLeft === 0) { // Expiring today
            expiringCount++;
            expiringItems.push(`${item.name} (Expiring Today!)`);
        } else if (timeLeft > 0 && timeLeft <= 3) { // Expiring in next 3 days
            expiringCount++;
            expiringItems.push(`${item.name} (Expiring in ${timeLeft} days)`);
        } else if (timeLeft < 0) { // Already expired
            expiredCount++;
            expiredItems.push(`${item.name} (Expired)`);
        }
    });

    // Show notification if items are expiring
    if (expiringCount > 0 && !sessionStorage.getItem("expiryAlertShown")) {
        showNotification(`⚠️ ${expiringCount} items are expiring soon!`, expiringItems);
        sessionStorage.setItem("expiryAlertShown", "true");
    }

    // Show notification for expired items
    if (expiredCount > 0 && !sessionStorage.getItem("expiredAlertShown")) {
        showNotification(`❌ ${expiredCount} items have expired!`, expiredItems);
        sessionStorage.setItem("expiredAlertShown", "true");
    }

    // Update fridge count notification
    updateFridgeCount();
}

// Function to create a dismissable notification
function showNotification(message, itemList) {
    let notification = document.createElement("div");
    notification.classList.add("notification-popup");
    notification.innerHTML = `
        <strong>${message}</strong>
        <ul>${itemList.map(item => `<li>${item}</li>`).join("")}</ul>
        <button onclick="this.parentElement.style.display='none'">Dismiss</button>
    `;
    document.body.appendChild(notification);
}

// Run function on page load
window.onload = function () {
    checkExpiringItems();
    updateFridgeCount();
};
