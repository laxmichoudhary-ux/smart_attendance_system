document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("employeeLoginForm");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent form from submitting

    const employeeId = document.getElementById("employeeIdInput").value.trim();
    const password = document.getElementById("employeePasswordInput").value.trim();

    // Sample data (in real case, fetch from DB)
    const storedUsers = JSON.parse(localStorage.getItem("employeeUsers")) || [];

    const user = storedUsers.find(user => user.employeeId === employeeId && user.password === password);

    if (user) {
      // Save logged in user info
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      localStorage.setItem("username", user.name); // for profile use

      // Redirect to dashboard
      window.location.href = "employee_dashboard.html";
    } else {
      alert("Invalid Employee ID or Password!");
    }
  });
});
