const express = require('express')
const path = require('path');
const app = express();
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose= require('mongoose')

const cookieParser = require("cookie-parser");



app.use(express.json());
dotenv.config();
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://jaaps.vercel.app',
    'https://www.jaaps.in',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
}));

// app.use(cors({
//   origin: process.env.NODE_ENV === 'production'
//     ? ['https://jaaps.vercel.app']
//     : 'http://localhost:3000',
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   credentials: true
// }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



const catalogueRoutes = require('./routes/catalogueRoutes');
const Register = require('./routes/registerRoute')
const adminRoute = require('./routes/admin');
const Contact = require('./routes/contactRoute')
const product = require('./routes/productRoute')
const Imagesupload = require('./routes/imageRoute');
const Login = require('./routes/loginRoute')
const careerRoutes = require("./routes/careerRoute");
const user = require("./routes/userRoute")
const otpRoute = require('./routes/otpRoutes')
const dashboard = require('./routes/dashboardRoute')
const category = require('./routes/catagoryRoute')


app.use((req, res, next) => {
  console.log("➡️ Incoming:", req.method, req.url);
  next();
});



app.use('/api/register', Register);
app.use('/api/catalogues', catalogueRoutes);
app.use('/api/admin' , adminRoute);
app.use('/api/contact' , Contact)
app.use('/api/product', product);
app.use('/api/images',Imagesupload);
app.use('/api/auth' , Login);
app.use("/api/career", careerRoutes);
app.use("/api/user" , user);
app.use("/api/otp",otpRoute);
app.use("/api/dashboard",dashboard)
app.use("/api/category",category);

const PORT = process.env.PORT || 5001;
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err.message));

app.listen(PORT , ()=>
    console.log(`server started on port ${PORT}` )
);