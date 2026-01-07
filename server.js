import express from "express";
import mongoose from "mongoose";
     import session from "express-session";
import bcrypt from "bcrypt";

import User from "./models/User.js";
import Task from "./models/Task.js";

const app = express();
// yaha pr mongodb connect karte hai normally;
mongoose.connect(
  "mongodb+srv://gauravmauryamaurya500_db_user:XZUxBkjc15pk756Q@cluster0.zkiy2jf.mongodb.net/todo"
)
.then(() => console.log("DB Connected"))
.catch(err => console.log(err));


  app.use(express.urlencoded({extended:true}));
app.use(session({
  secret:"secret",
  resave:false,
  saveUninitialized:false
}));

app.set("view engine","ejs");
// yaha pr hum css js file ko static folder se serve kar rahe hai
app.use(express.static("public"));

// yaha authentication ke liye routes banaye hai
app.get("/", (req,res)=> res.render("login"));
        app.get("/signup",(req,res)=> res.render("signup"));

app.post("/signup", async (req,res)=>{
  const {fname,lname,email,password} = req.body;
           
  const hash = await bcrypt.hash(password,10);
  await User.create({fname,lname,email,password:hash});
        res.redirect("/");
});

app.post("/login", async (req,res)=>{
  const user = await User.findOne({email:req.body.email});
  if(user && await bcrypt.compare(req.body.password,user.password)){
    req.session.userId = user._id;
    res.redirect("/index");
   
} else res.send("Invalid login");
});

app.get("/logout",(req,res)=>{
  req.session.destroy();
  res.redirect("/");
});

// yaha dashboard pr crud ke liye routes banaye hai jaha se hum tasks ko add kar sakte hai ,

app.get("/index", async (req,res)=>{
        if(!req.session.userId) return res.redirect("/");
  const tasks = await Task.find({user:req.session.userId});
  res.render("index",{tasks});
});
// post method ke liye routes banaya hai jaha se task add kar Task kar sakte hai
app.post("/add-task", async (req,res)=>
    {
         await Task.create({
    ...req.body,
    user:req.session.userId
  });
  res.redirect("/index");
});
// yaha pr task ko edit karne ke liye routes banaye hai
app.get("/edit/:id", async (req,res)=>{
  if(!req.session.userId) return res.redirect("/");
  
  const task = await Task.findById(req.params.id);
  res.render("edit",{task});
});

app.post("/edit/:id", async (req,res)=>{
  await Task.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    description: req.body.description,
    date: req.body.date
  });
  res.redirect("/index");
});
// delete ke liye routes banaya hai 
app.get("/delete/:id", async (req,res)=>{
  await Task.findByIdAndDelete(req.params.id);
  res.redirect("/index");
});

// yaha pr hamne profile ke liye routes banaye so tath ki user apna profile dekhe aor update kare 
app.get("/profile", async (req,res)=>{
       const user = await User.findById(req.session.userId);
  res.render("profile",{user});
});

app.post("/profile", async (req,res)=>
    {
  await User.findByIdAndUpdate(req.session.userId,req.body);
  res.redirect("/profile");
});

app.listen(1000,()=>console.log("Server Started"));
