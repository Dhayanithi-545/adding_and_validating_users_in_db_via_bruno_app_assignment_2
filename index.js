const express = require('express');
const { resolve } = require('path');
require('dotenv').config();
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const app = express();
const port = 3110;

app.use(express.static('static'));
app.use(express.json())

const userSchema = new mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true,
  }

})

const User = mongoose.model('User', userSchema)

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser : true,
  useUnifiedTopology :true
})
.then(()=>console.log("MongoDB Connected Successfully"))
.catch((err)=>console.log(err))




app.post('/register', async(req,res)=>{
  const {name, email, password} = req.body;
  if(!name || !email || !password){
    return res.json({message : 'All credentials Required'})
  }
  

  try {

    const existingUser = await User.findOne({email})
    if(existingUser){
      return res.json({message : "user already exists"})
    }

    // const salt = 10
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({name, email, password: hashedPassword})
    await user.save();
    return res.status(200).json({message : "User Created Successfully"})

  } catch (error) {
    return res.json({message : error.message})
    
  }
})

app.post('/login', async(req,res)=>{
  const { email, password} = req.body;
  if(!email || !password){
    return res.json({message : 'All credentials Required'})
  }

  try {

    const user = await User.findOne({email})
    if(!user){
      return res.json({message  :"Enter Valid Email"})
    }

    const isMatch = await bcrypt.compare(password, user.password )
    if(!isMatch){
      return res.json({message  :"Enter Valid Email"})
    }

    return res.json({message  : "Login Successfull",
      user : {
        id: user._id,
        name : user.name,
        email: user.email
      }
    })
  } catch (error) {
    return res.json({message : error.message})
    
  }

})




app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
