const mongoose = require('mongoose')
var Site = mongoose.Site;

const ProductSchema = mongoose.Schema({
    price: Number,
    name: String,
    image: String,
    id_si:[
        {type: Site.Types.ObjectId, ref: "Product"}
    ],
});



module.exports = mongoose.model("Product", ProductSchema)