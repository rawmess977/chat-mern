import bcrypt from 'bcryptjs'
import User from '../models/User.js';
import { generateToken } from '../lib/utils.js';
export const signup = async (req, res) => {
  
  try {
    const { fullName, email, password } = req.body; // undefined if express.json() middleware is not used
    
    // if (!fullName || !email || !password) {
    //   return res.status(400).json({ message: "All fields are required" });
    // }
    console.log(fullName, email, password)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

     // 🔐 Hash password with bcrypt 
     const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)


    //saving user in mongodb
    const newUser = new User({
      fullName, 
      email, 
      password:hashedPassword
    })

    
    if (newUser){
      generateToken(newUser._id, res);
      await newUser.save();
      
      res.status(201).json({
         _id: newUser._id, 
         fullName: newUser.fullName,
         email: newUser.email,
         profilePic: newUser.profilePic,
        //  password: newUser.password
        
      });
    }else{
      res.status(400).json({message: "Invalid user data"})
    }


    //jwt



    //

  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

