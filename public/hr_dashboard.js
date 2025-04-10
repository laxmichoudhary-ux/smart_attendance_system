document.addEventListener("DOMContentLoaded", () => {
  const employeeList = document.getElementById("employeeList");
  const attendanceRecords = document.getElementById("attendanceRecords");
  const addEmployeeButton = document.getElementById("addEmployee");
  
  // Load saved employee records
  function loadEmployees() {
      const savedEmployees = JSON.parse(localStorage.getItem("employees")) || [];
      employeeList.innerHTML = "";
      savedEmployees.forEach(emp => {
          const li = document.createElement("li");
          li.textContent = `${emp.name} (ID: ${emp.id})`;
          
          // Delete Button
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "Remove";
          deleteBtn.classList.add("delete-btn");
          deleteBtn.onclick = () => removeEmployee(emp.id);
          li.appendChild(deleteBtn);

          employeeList.appendChild(li);
      });
  }

  // Function to add an employee
  addEmployeeButton.addEventListener("click", () => {
      const empName = document.getElementById("empName").value;
      const empId = document.getElementById("empId").value;
      if (!empName || !empId) {
          alert("Please enter both Employee Name and ID.");
          return;
      }

      let employees = JSON.parse(localStorage.getItem("employees")) || [];
      employees.push({ name: empName, id: empId });
      localStorage.setItem("employees", JSON.stringify(employees));
      loadEmployees();
  });

  // Function to remove an employee
  function removeEmployee(empId) {
      let employees = JSON.parse(localStorage.getItem("employees")) || [];
      employees = employees.filter(emp => emp.id !== empId);
      localStorage.setItem("employees", JSON.stringify(employees));
      loadEmployees();
  }

  // Load saved attendance records
  function loadAttendanceRecords() {
      const savedRecords = JSON.parse(localStorage.getItem("attendanceRecords")) || [];
      attendanceRecords.innerHTML = "";
      savedRecords.forEach(record => {
          const row = document.createElement("tr");
          row.innerHTML = `<td>${record.id}</td><td>${record.name}</td><td>${record.date}</td><td>${record.time}</td>`;
          attendanceRecords.appendChild(row);
      });
  }

  loadEmployees();
  loadAttendanceRecords();
});
