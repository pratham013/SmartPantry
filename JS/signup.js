document.getElementById("signup-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirm-password").value;
    let termsChecked = document.getElementById("terms").checked;

    // Simple Validation
    if (name === "" || email === "" || password === "" || confirmPassword === "") {
        alert("Please fill in all fields.");
        return;
    }

    if (!validateEmail(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    if (!termsChecked) {
        alert("You must agree to the Terms & Conditions.");
        return;
    }

    // Store user data (Simulating account creation)
    localStorage.setItem("user", JSON.stringify({ name, email, password }));
    alert("Signup successful! Redirecting to login.");
    window.location.href = "login.html"; // Redirect to login
});

// Email validation function
function validateEmail(email) {
    let regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
