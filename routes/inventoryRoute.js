const express = require("express");

const {
    getAllInventories, getInventory, createInventory, deleteInventory, updateInventory
} = require("../controllers/invController");
const { protect, restrictUser } = require("../controllers/authController");
const router = express.Router();

app.use(protect);
router.route("/")
    .get(getAllInventories)
 .post(restrictUser("user"), createInventory);

router.route("/:id")
    .get(getInventory)
    .patch(restrictUser("user"), updateInventory)
    .delete(restrictUser("user"), deleteInventory);


module.exports = router