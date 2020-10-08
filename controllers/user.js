import Post from "../models/post.js";
import User from "../models/user.js";

import { cloudinary } from "../config/cloudinary.js";

export const getUserById = (req, res) => {
  User.findOne({ _id: req.params.id })
    .select("-password")
    .populate("following", "_id username pic")
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate("postedBy", "_id username fullname pic banner")
        .populate("comments.postedBy", "_id username fullname pic banner")
        .sort("-createdAt")
        .exec((err, posts) => {
          if (err) {
            return res.status(422).json({ error: err });
          }
          res.json({ user, posts });
        });
    })
    .catch((err) => {
      return res.status(404).json({ error: "User not found" });
    });
};

export const follow = (req, res) => {
  User.findByIdAndUpdate(
    req.body.followId,
    {
      $push: { followers: req.user._id },
    },
    { new: true },
    (err, reult) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { following: req.body.followId },
        },
        { new: true }
      )
        .select("-password")
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
};

export const unfollow = (req, res) => {
  User.findByIdAndUpdate(
    req.body.unfollowId,
    {
      $pull: { followers: req.user._id },
    },
    { new: true },
    (err, reult) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { following: req.body.unfollowId },
        },
        { new: true }
      )
        .select("-password")
        .then((result) => {
          res.json(result);
        })
        .catch((err) => {
          return res.status(422).json({ error: err });
        });
    }
  );
};

export const updatebanner = async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { banner: req.body.banner } },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      res.json(result);
    }
  );
};

export const updateprofilepic = async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    { $set: { pic: req.body.pic } },
    { new: true },
    (err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      res.json(result);
    }
  );
};

export const search = (req, res) => {
  let usePattern = new RegExp(["^", req.body.query].join(""), "i");
  User.find({ fullname: { $regex: usePattern } })
    .select("_id fullname username pic")
    .then((user) => {
      res.json({ user });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getFollowers = (req, res) => {
  User.findOne({ _id: req.user._id })
    .select("following")
    .populate("following", "_id username fullname pic banner")
    .sort({ username: "asc" })
    .then((users) => {
      res.json({ users });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getUserByName = (req, res) => {
  User.find({
    username: {
      $regex: req.params.name,
      $options: "i",
    },
  })
    .select("_id username pic")
    .sort({ username: "asc" })
    .limit(5)
    .then((users) => {
      res.json({ users });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getComments = (req, res) => {
  const id = req.params.id;
  Post.findOne({ _id: id })
    .populate("commnents", "text created_at")
    .sort([["created_at", -1]])
    .populate("comments.postedBy", "_id username fullname pic banner following")
    .populate("postedBy", "_id username pic")

    .exec((err, posts) => {
      if (err) {
        return res.status(422).json({ error: err });
      }
      res.json({ posts });
    });
};
