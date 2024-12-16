const mongoose = require('mongoose')


const keysecret =  "NayanProject_n-bus"






const userSchema = new mongoose.Schema({
    
    email:{
        type:String,
        required:true,
        unique:true,
    

    },
     
    password:{
        type:String,
        required:true,
        
    },    
 
    

})







    const userdb = mongoose.model("users",userSchema)


module.exports = userdb;