const express = require("express");
const UserController = require("../controllers/userController");
const checkToken = require("../middlewares/checkToken");
const router = express.Router();

router.post("/register", UserController.create);
router.post("/login", UserController.login);
router.post("/checkToken", checkToken, UserController.checkToken);

module.exports = router;