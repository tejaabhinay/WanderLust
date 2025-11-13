const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geoCodingClient = mbxGeocoding({ accessToken: mapToken });
module.exports.index=async(req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}
module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new.ejs",)
}
module.exports.showListing=async(req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",
        populate:{
            path:"author",
        },
    }).populate("owner");
    if(!listing)
    {
        req.flash("error","Listing Not Avaliable");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}
module.exports.createListing=async(req,res,next)=>{
    let response=await geoCodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
    })
    .send()
  
        const newListing=new Listing(req.body.listing);
        newListing.owner=req.user._id;
        newListing.image=req.file.path;
        newListing.geometry = response.body.features[0].geometry;
        await newListing.save();
        req.flash("success","New Listing Created");
        res.redirect("/listings");
}
module.exports.renderEditForm=async(req,res)=>{
    let {id}= req.params;
    const listing=await Listing.findById(id);
    req.flash("success","Listing Edited");

    let originalImageUrl=listing.image;
    originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
}
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // geocode again when location changes
    const response = await geoCodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    if (!response.body.features.length) {
        req.flash("error", "Invalid location");
        return res.redirect(`/listings/${id}/edit`);
    }

    const listing = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { new: true }
    );

    // update geometry
    listing.geometry = response.body.features[0].geometry;

    if (req.file) {
        listing.image = req.file.path;
    }

    await listing.save();

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};
module.exports.destroyListing=async(req,res)=>{
        let {id}= req.params;
        let deleteListing=await Listing.findByIdAndDelete(id);
        req.flash("success","Listing Deleted");
        res.redirect("/listings");
}