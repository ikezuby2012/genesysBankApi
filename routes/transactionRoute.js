const express = require("express");
const { protect, restrictUser } = require("../controllers/authController");
const {
    getAllTransactions, deposit, withdrawal, getTransaction, transfer, reverseTransfer, getTransactionByUserId
} = require("../controllers/transactionController");

const router = express.Router();

router.use(protect);
router.route("/")
    .get(restrictUser("user"), getAllTransactions);

router.route("/:id").get(getTransaction);
router.get("/user/:id", getTransactionByUserId);

router.route("/deposit").post(deposit);
router.post("/withdrawal", withdrawal);

//the id params is the recipient objectId i.e the receiver id
router.post("/transfer/:id", transfer);

//reverse transaction
router.post("/reverse/:id", restrictUser("user"), reverseTransfer);

module.exports = router;