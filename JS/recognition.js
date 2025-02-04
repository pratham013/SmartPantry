// Redirect to manual entry page
function addManually() {
    window.location.href = "../HTML/manual_entry.html";
}

let model;
let video = document.getElementById("webcam");
let detectedList = document.getElementById("detected-items");

// Load AI Model
async function loadModel() {
    model = await cocoSsd.load();
    console.log("AI Model Loaded!");
}
// Start Webcam
async function startWebcam() {
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
            })
            .catch((error) => {
                console.error("Webcam access denied!", error);
            });
    }
}

// ✅ Redirect to the database page
function goToDatabase() {
    window.location.href = "../HTML/database.html";
}


// Ensure everything loads properly
window.onload = function () {
    loadModel();
    startWebcam();
};

// Capture & Detect Ingredients
async function captureAndDetect() {
    if (!model) {
        alert("AI model not loaded yet. Please wait!");
        return;
    }

    const predictions = await model.detect(video);
    detectedList.innerHTML = ""; // Clear previous results

    if (predictions.length === 0) {
        alert("No recognizable food items detected. Please try again!");
        return;
    }

    // Show checkboxes for user to select correct items
    predictions.forEach(prediction => {
        let item = document.createElement("li");
        item.innerHTML = `
            <input type="checkbox" value="${prediction.class}">
            ${prediction.class} (${Math.round(prediction.score * 100)}% confidence)
        `;
        detectedList.appendChild(item);
    });

    // Add Confirm Button to process user selection
    let confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Confirm & Add";
    confirmBtn.classList.add("btn");
    confirmBtn.onclick = saveSelectedItems;
    detectedList.appendChild(confirmBtn);
}

function saveSelectedItems() {
    let checkboxes = document.querySelectorAll("#detected-items input[type='checkbox']");
    let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            let itemName = checkbox.value;

            // ✅ Capitalize the first letter
            itemName = itemName.charAt(0).toUpperCase() + itemName.slice(1);

            // ✅ Ask for quantity
            let quantity = parseInt(prompt(`Enter quantity for ${itemName}:`, 1));
            if (isNaN(quantity) || quantity <= 0) {
                quantity = 1; // Default to 1 if invalid input
            }

            // ✅ Auto-fill expiration date
            let expirationDays = 7; // Default 7 days
            let expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + expirationDays);
            expirationDate = expirationDate.toISOString().split("T")[0];

            // ✅ Save to LocalStorage
            storedIngredients.push({
                name: itemName, // ✅ Now stored with Capitalized first letter
                quantity: quantity,
                expiration: expirationDate,
            });
        }
    });

    console.log("Ingredients Stored:", storedIngredients);
    localStorage.setItem("ingredients", JSON.stringify(storedIngredients));

    // ✅ Redirect to database after saving
    setTimeout(() => {
        goToDatabase();
    }, 500);
}


// Load AI Model & Webcam
window.onload = function () {
    loadModel();
    startWebcam();
};
