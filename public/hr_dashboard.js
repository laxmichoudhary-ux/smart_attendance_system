
// hr_dashboard.js

function fetchAllAttendance() {
    fetch('/getAllAttendance')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const tableBody = document.getElementById('attendanceTableBody');
          const activityLog = document.getElementById('activityLog');
          let present = 0, late = 0, absent = 0;
  
          tableBody.innerHTML = '';
          activityLog.innerHTML = '';
  
          data.attendance.forEach(record => {
            const row = `<tr>
              <td>${record.employee_id}</td>
              <td>${record.username}</td>
              <td>${record.date}</td>
              <td>${record.time}</td>
            </tr>`;
            tableBody.innerHTML += row;
  
            const log = `<li class="list-group-item">${record.username} marked present on ${record.date} at ${record.time}</li>`;
            activityLog.innerHTML += log;
  
            // Example logic based on time (optional improvement)
            const hour = parseInt(record.time.split(':')[0]);
            if (hour <= 9) present++;
            else late++;
          });
  
          document.getElementById('presentCount').innerText = present;
          document.getElementById('lateCount').innerText = late;
          document.getElementById('absentCount').innerText = absent;
          document.getElementById('leaveCount').innerText = 3;
        } else {
          console.warn("No attendance data received from backend.");
          document.getElementById('attendanceTableBody').innerHTML = '<tr><td colspan="4" class="text-center">No attendance records found</td></tr>';
        }
      })
      .catch(err => {
        console.error('Error loading attendance:', err);
      });
  }

  
  //chart 
 
  const chartOptions = {
    series: [{ name: 'Attendance', data: [95, 90, 85, 80, 70, 95, 100] }],
    chart: { height: 280, type: 'line' },
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
  };
  
  const chart = new ApexCharts(document.querySelector("#attendanceChart"), chartOptions);
  chart.render();
  
  // Run after DOM is ready
  window.addEventListener("DOMContentLoaded", () => {
    fetchAllAttendance();
  
    const logoutBtn = document.querySelector(".btn.btn-outline-secondary.btn-sm");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        window.location.href = "/logout";
      });
    }
 
  });
  