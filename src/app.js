const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const mysql = require('mysql2');
const fs = require('fs');
const session = require('express-session');

// Initialize Express app
const app = express();



// Add this middleware
app.use(session({
    secret: 'your-secret-key', // change this to a strong secret in production
    resave: false,
    saveUninitialized: false,
    //cookie: { maxAge: 1000 * 60 * 60 } // 1 hour session
}));





// Static files (public folder)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public'),{
      setHeaders: (res, path) => {
     res.setHeader('Cache-Control', 'no-store');
},
}));


// Setup multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});
const upload = multer({ storage });

// Setup MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123412345',
    database: 'linkedin_clone',
});

    db.connect((err) => {
        if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Route to serve the HTML file
// Serve the dashboard file by default
app.get('/', (req, res) => {
    console.log('Serving company-portal.html');
    res.sendFile(path.join(__dirname, '../public/company-portal.html')); // Adjust to your main HTML file name
});


app.get('/login', (req, res) => {
    const filePath = path.join(__dirname, '../public', 'login.html');
    console.log('Serving login page from:', filePath); // Debug: Check the exact file path
    res.sendFile(filePath);
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error("Logout error:", err);
      res.redirect('/');
    });
  });
  
  app.get('/getEmployeeInfo', (req, res) => {

    if (req.session?.username && req.session?.employee_id) {
      return res.json({
        success: true,
        username: req.session.username,
        employee_id: req.session.employee_id
      });
    } else {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }
  });


  app.get('/getAllAttendance', (req, res) => {
    const fetchSql = `
      SELECT u.username, u.employee_id, a.date, a.time
      FROM attendance a
      JOIN users u ON a.employee_id = u.employee_id
      ORDER BY a.time DESC
    `;
  
    db.query(fetchSql, (err, records) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch attendance records',
          attendance: []
        });
      }
  
      const formattedRecords = records.map(record => {
        const date = new Date(record.date);
        const time = new Date(record.time);
  
        return {
          ...record,
          date: date.toLocaleDateString('en-IN'),
          time: time.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
          })
        };
      });
  
      res.json({
        success: true,
        message: 'Attendance fetched successfully',
        attendance: formattedRecords
      });
    });
  });


  app.get('/getAttendance', (req, res) => {
    if (!req.session || !req.session.employee_id) {
        return res.status(401).json({ success: false, message: 'Unauthorized: No session' });
    }

    const employee_id = req.session.employee_id;

    const fetchSql = `
        SELECT u.username, u.employee_id, a.date, a.time
        FROM attendance a
        JOIN users u ON a.employee_id = u.employee_id
        WHERE a.employee_id = ?
        ORDER BY a.time DESC
    `;

    db.query(fetchSql, [employee_id], (err, records) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch attendance records',
                attendance: []
            });
        }
        const formattedRecords = records.map(record => {
            const date = new Date(record.date);
            const time = new Date(record.time);
        
            return {
                ...record,
                date: date.toLocaleDateString('en-IN'), // DD/MM/YYYY
                time: time.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }) // e.g., 06:21 PM
            };
        });

        res.json({
            success: true,
            message: 'Attendance fetched successfully',
            attendance: formattedRecords
        });
    });
});

  


  app.get('/employeeDashboard', (req, res) => {
    if (req.session.username && req.session.employee_id) {
        console.log('Serving dashboard for:', req.session.username);
        const filePath = path.join(__dirname, '../public', 'employee_dashboard.html');
            // Optional: prevent caching
             res.setHeader('Cache-Control', 'no-store');
             res.setHeader('Pragma', 'no-cache');
             res.setHeader('Expires', '0');

             res.sendFile(filePath);

     
    } else {
        console.log('User not logged in');
      res.redirect('/'); // Redirect to login if not logged in
    }
  });
  


// emplooyee Login API
app.post('/employeeLogin', (req, res) => {
    const { employee_id, password } = req.body;
    const query = 'SELECT * FROM users WHERE employee_id = ? AND password = ?';
  
    db.query(query, [employee_id, password], (err, results) => {
      if (err) return res.status(500).send('Server error');
      if (results.length > 0) {
        const user = results[0];

        // Store session data
        req.session.username = user.username;
        req.session.employee_id = user.employee_id;
 
         // Send success response
         return res.status(200).json({ success: true, user });

        
      } else {
       return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

     
    });
  
  });





// Define /signup route
app.post('/signup', upload.single('faceData'), (req, res) => {
    console.log('Received request at /signup');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    const { username, employee_id, password } = req.body;
    const faceData = req.file ? req.file.filename : null;

    // Ensure that username is properly set
    if (!username) {
        return res.status(400).send('Username is required');
    }

    const datasetPath = path.join(__dirname, 'datasets', username);

 

        // Make sure the dataset folder exists
        if (!fs.existsSync(datasetPath)) {
            fs.mkdirSync(datasetPath);
        }

        // Path to Python script for face detection
        const pythonScriptPath = path.join(__dirname, 'python', 'face_detection.py');

        // Command to execute the script for face detection
        const pythonCommand = `python "${pythonScriptPath}" "${datasetPath}" "${req.file.path}"`;

        exec(pythonCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Error running Python script:', error);
                return res.status(500).send('Error processing face data');
            }
            console.log('Python script output:', stdout);

            // Save user details to MySQL database
            const sql = 'INSERT INTO users (username, employee_id, password, face_data) VALUES (?, ?, ?, ?)';
            db.query(sql, [username, employee_id, password, faceData], (err, result) => {
                if (err) {
                    console.error('Error inserting data:', err);
                    return res.status(500).send('Database error');
                  
                   
                }
              //  console.log('User signed up:', result);
                

                // Clear any existing session
                req.session.regenerate((err) => {
                     if (err) {
                         console.error('Session regeneration error:', err);
                         return res.status(500).send('Session error');
                        }
                
                         // Set new session data for the newly signed-up user
                        req.session.username = username;

                       // Redirect to employee dashboard
                        res.redirect('/employeeDashboard');
                });

                

                
            });
        });
    //});
});

// Define /login route for attendance
app.post('/login', upload.single('faceData'), (req, res) => {
    console.log('Received request at /login');
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    const { username } = req.body;
    const faceData = req.file ? req.file.filename : null;

    // Ensure that username is properly set
    if (!username) {
        return res.status(400).send('Username is required');
    }

    // Path to your Python script for face recognition
    const pythonScriptPath = path.join(__dirname, 'python', 'face_recognition_script.py');
    console.log(pythonScriptPath)
     // Ensure that the file exists at the given path
     if (!fs.existsSync(pythonScriptPath)) {
        console.error('Python script not found at:', pythonScriptPath);
        // return res.status(500).send('Python script not found');
        return res.status(500).json({ success: false, message: 'Python script not found' });
    
    }
    
    // Execute Python script for face recognition
    const pythonCommand = `python "${pythonScriptPath}" "${username}" "${req.file.path}"`;

    exec(pythonCommand, (error, stdout, stderr) => {
        if (error) {
            console.error('Error running Python script:', error);
            // return res.status(500).send('Error verifying face data');
            return res.status(500).json({ success: false, message: 'Error verifying face data' });
        
        }
        console.log('Python script output:', stdout);



      




//new attendance record
if (stdout.includes('Face match: True')) {
    // ✅ Get employee_id for the username
    const userSql = 'SELECT employee_id FROM users WHERE username = ?';
    db.query(userSql, [username], (err, userResult) => {
        if (err || userResult.length === 0) {
            return res.status(500).json({ success: false, message: 'User not found' });
        }

        const employee_id = userResult[0].employee_id;
        req.session.username = username;
        req.session.employee_id = employee_id;



        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        // ✅ Insert into attendance
        const attendanceSql = 'INSERT INTO attendance (employee_id, date) VALUES (?, ?)';
        db.query(attendanceSql, [employee_id, today], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Attendance marking failed' });
            }

            // ✅ Fetch full attendance with JOIN
            const fetchSql = `
                SELECT u.username, u.employee_id, a.date, a.time
                FROM attendance a
                JOIN users u ON a.employee_id = u.employee_id
                WHERE u.username = ?
                ORDER BY a.time DESC
            `;

            


            db.query(fetchSql, [username], (err, records) => {
                if (err) {
                    return res.status(500).json({
                        success: true,
                        message: 'Login success, but failed to fetch attendance',
                        attendance: []
                    });
                }

                res.json({
                    success: true,
                    message: 'Login and attendance successful',
                    attendance: records,
                    username
                });
            });
        });
    });

} else {
    res.status(401).json({ success: false, message: 'Face recognition failed' });
}
});
});






// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});





