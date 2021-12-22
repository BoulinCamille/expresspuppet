const mongoose = require('mongoose')


const SiteSchema = mongoose.Schema({
    url_si: String,
    nom_si: String,
});


const Site = mongoose.model("Site", SiteSchema, "Site")


module.exports = Site;