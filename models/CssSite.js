const mongoose = require('mongoose')
var Site = mongoose.Site;

const CssSiteSchema = mongoose.Schema({
    price_css: String,
    name_css: String,
    image_cvs: String,
    id_si: [
        {type: Site.Types.ObjectId, ref: "Site"}
    ],
});




module.exports = mongoose.model("CssSite", CssSiteSchema)