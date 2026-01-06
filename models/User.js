import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fname:String,
  lname:String,
  email:String,
  password:String
});

export default mongoose.model("User",userSchema);
