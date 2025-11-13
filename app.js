if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const dbUrl=process.env.ATLASDB_URL;
const path=require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
const methodOverride=require("method-override");
app.use(methodOverride("_method"));
const ejsMate=require("ejs-mate");
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require('connect-mongo');
const listingsRouter=require("./routes/listing.js");
const reviewsRouter=require("./routes/reviews.js");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");
const userRouter=require("./routes/user.js");
const Listing=require("./models/listing");
const mapToken=process.env.MAP_TOKEN;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });
main()
    .then(()=>{
    console.log("Connect to DB");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(dbUrl);
}
const store=MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*3600,
});
const sessionOptions={
    store,
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()*7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpsOnly:true,
    }
};


store.on("error",()=>{
    console.log(err);
})
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"Teja-Abhinay"
//     });
//     const regUser=await User.register(fakeUser,"helloworld");
//     res.send(regUser);
// });

// app.get("/",(req,res)=>{
//     res.send("Server started");
// });

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

// Home route (important for Render)
app.get("/", (req, res) => {
  res.redirect("/listings");
});

// 404 Handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error Handler
app.use((err, req, res, next) => {
  console.log("🔥 Error caught:", err.message);
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
