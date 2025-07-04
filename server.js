const express = require('express');
const app =express();
require('dotenv').config()
const userRoutes = require('./routes/userRoutes')
const candidateRoutes = require('./routes/candidateRoutes')
const connectDb = require('./config/db')
const cookieParser = require('cookie-parser');


app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended:true}));

app.use('/user' , userRoutes);
app.use('/candidate'  , candidateRoutes);
app.use('/vote'  , candidateRoutes);

connectDb()
const PORT = process.env.PORT || 3000

app.listen(PORT , (req,res)=>{
    console.log(`server running on PORT ${PORT}`)
})