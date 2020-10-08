import express from "express";
const router = express.Router();
import {
  allposts,
  comment,
  createpost,
  deletepost,
  followingposts,
  like,
  myposts,
  unlike,
} from "../controllers/post.js";
import RequireLogin from "../middlewares/RequireLogin.js";

router.get("/allposts", RequireLogin, allposts);
router.get("/followingposts", RequireLogin, followingposts);
router.get("/myposts", RequireLogin, myposts);
router.post("/createpost", RequireLogin, createpost);
router.put("/like", RequireLogin, like);
router.put("/unlike", RequireLogin, unlike);
router.put("/comment", RequireLogin, comment);
router.delete("/deletepost/:postId", RequireLogin, deletepost);

export { router };
