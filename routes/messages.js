import express from "express";
import MessagesController from "../controllers/MessagesController";

const router = express.Router();

router.post('/send', MessagesController.send);
router.get('/list/:friendId', MessagesController.list);
router.put('/open', MessagesController.open);

export default router;
