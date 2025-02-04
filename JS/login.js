document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;

    // Get stored user data
    let storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
        alert("No user found. Please sign up first.");
        return;
    }

    if (email !== storedUser.email || password !== storedUser.password) {
        alert("Invalid email or password.");
        return;
    }

    alert("Login successful! Redirecting...");
    window.location.href = "dashboard.html"; // Redirect after login
});
