const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing=require("../models/listing.js");
const url='mongodb://127.0.0.1:27017/wonderlust';

main()
    .then(()=>{
    console.log("Connect to DB");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(url);
}

const initDB=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"6913f59a5c1d26f1ed297c4a"}));
    await Listing.insertMany(initData.data);
    console.log("Data was Intialized");
}

initDB();