const express = require("express");
const { protect } = require("../controllers/authController");
const {
    getAllTransactions, deposit, withdrawal, getTransaction, transfer, reverseTransfer
} = require("../controllers/transactionController");

const router = express.Router();

router.use(protect);
router.route("/").get(getAllTransactions);

router.route("/:id").get(getTransaction);

router.route("/deposit").post(deposit);
router.post("/withdrawal", withdrawal);

//the id params is the recipient objectId i.e the receiver id
router.post("/transfer/:id", transfer);

//reverse transaction
router.post("/reverse/:id", reverseTransfer);

module.exports = router;