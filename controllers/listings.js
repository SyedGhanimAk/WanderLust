const Listing = require("../models/listing.js");
const expressErr = require("../utils/expressErr.js");
module.exports.home = async (req, res) => {
    Listing.find().then((result) => {
        res.render("home.ejs", { result });
    });
};

module.exports.RedirectToListings = async (req, res) => {
    res.redirect("/listings");
}

module.exports.NewListingForm = async (req, res) => {
    res.render("newlistingform.ejs");
}

module.exports.NewListingPost = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    let { country, location, price, description, title } = req.body;

    if (!country || !location || !price || !title) {
        next(new expressErr(400, "Data not valid for listing"))
    } else {
        let newlisting = new Listing({
            country: country, location: location, price: price, image: { url, filename }, description: description, title: title, owner: req.user._id
        });
        req.flash("success", "New listing created");
        newlisting.save().then(() => {
            res.redirect("/listings");
        })
    }
}

module.exports.listingDetail = async (req, res, next) => {
    let { id } = req.params;
    let result = await Listing.findById(id).populate({ path: "reviews", populate: { path: "createdBy" } }).populate("owner");
    // populate opens up details in a _id.
    // path: "reviews", populate: { path: "author" } means we are doing populate nesting. populating reviews and createdBy which is a part of reviews
    if (!result) {
        next(new expressErr(404, "Page not found!"));
    } else {
        let UserExists = res.locals.userDetails;
        res.render("listingDetail.ejs", { result, UserExists })
    }
}

module.exports.editlistingform = async (req, res) => {
    let { id } = req.params;

    Listing.findById(id).then((result) => {
        let ogUrl = result.image.url;
        newUrl = ogUrl.replace("/upload", "/upload/h_200,w_300")
        res.render("editlistingform.ejs", { result, newUrl })
    })
}

module.exports.editlistingPost = async (req, res) => {
    let { id } = req.params;
    let { location, price, description, title } = req.body;
    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        Listing.updateOne({ _id: id }, { location: location, price: price, image: { url, filename }, description: description, title: title }).then(() => {
            req.flash("success", "Listing updated");
            res.redirect(`/listings/${id}`);
        })
    }
    else {
        Listing.updateOne({ _id: id }, { location: location, price: price, description: description, title: title }).then(() => {
            req.flash("success", "Listing updated");
            res.redirect(`/listings/${id}`);
        })
    }

}

module.exports.deletelistingPost = async (req, res) => {
    let { id } = req.params;
    Listing.findByIdAndDelete(id).then(() => {
        req.flash("success", "Listing deleted");
        res.redirect("/listings")
    });
}


