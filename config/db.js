const mongoose = require('mongoose');
const connectDb =async () =>{
try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('MongoDb Connected.');
    
} catch (error) {
    console.log('Connection Failed');
    
}
}
module.exports = connectDb