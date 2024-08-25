const express = require("express");
const RoomController = require("../controllers/roomController");
const router = express.Router();
const checkToken = require("../middlewares/checkToken");

router.get("/", RoomController.list);
router.get("/:roomId", checkToken, RoomController.messages);
router.post("/create", checkToken, RoomController.create);
router.post("/message", checkToken, RoomController.sendMessage);
router.post("/join/:roomId", checkToken, RoomController.join);

module.exports = router;