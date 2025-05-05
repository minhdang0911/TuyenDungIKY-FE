const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const userRoutes = require('./Routes/userRoutes');
const phongbanRoutes = require('./Routes/phongbanRoutes');
const thanhtichRoutes = require('./Routes/thanhTichRoutes');
const khenthuongRoutes = require('./Routes/khenthuongRoutes');;
const rolesRoutes = require('./Routes/roleRoutes');
const jobRoutes = require('./Routes/jobRoutes')
const applicationRoutes = require('./Routes/applicationRoutes');

const app = express();
const cors = require('cors');
connectDB();

 
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));   
app.use(cookieParser());

app.use(cors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true
  }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/phongban', phongbanRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/thanhtich', thanhtichRoutes);
app.use('/api/khenthuong', khenthuongRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/application', applicationRoutes);

app.get('/hello', (req, res) => {
  res.send('Hello World');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
