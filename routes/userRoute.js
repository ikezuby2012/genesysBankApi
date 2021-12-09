const express = require("express");
const { login, signup, protect, restrictUser } = require("../controllers/authController");
const {
    deleteUser, disableAccount, getAllUsers
} = require("../controllers/userController")

const router = express.Router();

router.post("/login", login);
router.post("/signup", protect, restrictUser("user"), signup);

router.use(protect);
router.route("/")
    .post(restrictUser("user"), getAllUsers);
router.route("/:id")
    .delete(restrictUser("user"), deleteUser)
    .patch(restrictUser("user"), disableAccount);

module.exports = router;