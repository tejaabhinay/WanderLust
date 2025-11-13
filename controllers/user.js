const User=require("../models/user.js");

module.exports.renderSignUpForm=(req,res)=>{
    res.render("user/signup.ejs");
}

module.exports.signup=async(req,res)=>{
    try{
    let{username,email,password}=req.body;
    const newUser=new User({email,username});
    const regisUser=await User.register(newUser,password);
    console.log(regisUser);
    req.login(regisUser,(err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","Welcome to Wonderlust");
        res.redirect("/listings");
    })

    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
}
module.exports.renderLoginForm=(req,res)=>{
    res.render("user/login.ejs");
}
module.exports.login=async(req,res)=>{
    req.flash("success","Welcome to WonderLust");
    let redirecturl=res.locals.redirectUrl||"/listings";
    res.redirect(redirecturl);
}
module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        req.flash("success","Logged out");
        res.redirect("/listings");
    });
};