document.addEventListener("DOMContentLoaded", function () {
    const barcodeData = document.getElementById("barcode-data");
    const startScanBtn = document.getElementById("start-button");
    const manualInput = document.getElementById("manual-barcode");
    const manualSubmit = document.getElementById("manual-submit");
    let isScannerRunning = false; // Prevent multiple initializations

    // ✅ Start Barcode Scanner
    function startBarcodeScanner() {
        if (typeof Quagga === "undefined") {
            console.error("❌ Quagga.js not loaded!");
            return;
        }

        if (isScannerRunning) {
            console.log("🔄 Scanner is already running...");
            return;
        }

        isScannerRunning = true;

        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: "#interactive",
                constraints: {
                    width: 1920,
                    height: 1080,
                    facingMode: "environment",
                },
            },
            locator: {
                patchSize: "x-large",
                halfSample: false,
            },
            decoder: {
                readers: ["ean_reader", "code_128_reader", "upc_reader"],
                multiple: false,
            },
            locate: true,
        }, function (err) {
            if (err) {
                console.error("❌ Error initializing Quagga:", err);
                isScannerRunning = false;
                return;
            }
            console.log("✅ Quagga started.");
            Quagga.start();
        });

        // ✅ Debugging Barcode Detection
        Quagga.onProcessed(function () {
            console.log("🔍 Processing frames...");
        });

        Quagga.onDetected(async function (result) {
            let barcode = result.codeResult.code;
            console.log("✅ Barcode Detected:", barcode);
            barcodeData.textContent = `Detected: ${barcode}`;
            Quagga.stop();
            isScannerRunning = false;

            // ✅ Fetch product name & add to database
            let detectedItem = await getItemNameFromBarcode(barcode);
            if (detectedItem) {
                let quantity = prompt(`Enter quantity for ${detectedItem}:`, "1");
                let expiration = prompt("Enter expiration date (YYYY-MM-DD):", "");

                if (quantity && expiration) {
                    addToDatabase(detectedItem, quantity, expiration);
                }
            } else {
                alert("Item not found. Please add manually.");
            }
        });
    }

    // ✅ Manual Barcode Entry
    manualSubmit.addEventListener("click", async function () {
        let barcode = manualInput.value.trim();
        if (!barcode) {
            alert("Please enter a barcode.");
            return;
        }

        console.log("📌 Manual Barcode Entered:", barcode);
        barcodeData.textContent = `Detected: ${barcode}`;

        let detectedItem = await getItemNameFromBarcode(barcode);
        if (detectedItem) {
            let quantity = prompt(`Enter quantity for ${detectedItem}:`, "1");
            let expiration = prompt("Enter expiration date (YYYY-MM-DD):", "");

            if (quantity && expiration) {
                addToDatabase(detectedItem, quantity, expiration);
            }
        } else {
            alert("Item not found. Please enter manually.");
        }
    });

    // ✅ Fetch Item Name from Open Food Facts API
    async function getItemNameFromBarcode(barcode) {
        let apiURL = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        try {
            let response = await fetch(apiURL);
            if (!response.ok) throw new Error("Network error");
            let data = await response.json();
            return data.product ? data.product.product_name : null;
        } catch (error) {
            console.error("❌ Error fetching item:", error);
            return null;
        }
    }

    // ✅ Store Item in Local Storage
    function addToDatabase(name, quantity, expiration) {
        let storedIngredients = JSON.parse(localStorage.getItem("ingredients")) || [];
        storedIngredients.push({ name, quantity, expiration, scanned: true });
        localStorage.setItem("ingredients", JSON.stringify(storedIngredients));
        alert(`✅ ${name} has been added to your fridge inventory.`);
        window.location.href = "database.html";
    }

    // ✅ Event Listener for Scanner Start
    if (startScanBtn) {
        startScanBtn.addEventListener("click", function () {
            console.log("🔍 Start button clicked, initializing scanner...");
            startBarcodeScanner();
        });
    } else {
        console.error("❌ Start button not found!");
    }
});
