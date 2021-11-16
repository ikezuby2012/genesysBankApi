const express = require("express");

const { addToCart, getAllCart, getCart} = require("./../controllers/cartController");
const router = express.Router()

router.route("/")
    .all(getAllCart)
    .post(addToCart);
    
router.route("/:id").get(getCart);

module.exports = router;