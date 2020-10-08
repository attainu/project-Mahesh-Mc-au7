import Post from "../models/post.js";
import { uploader } from "../utils/index.js";
import { cloudinary } from "../config/cloudinary.js";

export const allposts = (req, res) => {
  Post.find()
    .populate("postedBy", "_id username fullname pic banner")
    .populate("comments.postedBy", "_id username fullname pic banner")
    .sort("-createdAt")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const followingposts = (req, res) => {
  Post.find({ postedBy: { $in: req.user.following } })
    .populate("postedBy", "_id username fullname pic banner")
    .populate("comments.postedBy", "_id username fullname pic banner")
    .sort("-createdAt")
    .then((posts) => {
      res.json({ posts });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const createpost = async (req, res) => {
  console.log("create Post BE----", req.body.pic);
  const { body, pic } = req.body;
  const data = {
    body: body,
    media: "",
    postedBy: req.user,
  };
  if (!body && !pic) {
    return res.status(422).json({ error: "please write something first" });
  }
  if (pic) {
    const result = await cloudinary.uploader.upload(pic);
    console.log("result BE Cloudinary---->>", result);
    data.media = result.url;
  }
  req.user.password = undefined;

  const post = new Post(data);
  post
    .save()
    .then((result) => {
      console.log(result);
      res.json({ post: result });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const myposts = (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id username fullname pic banner")
    .populate("comments.postedBy", "_id username fullname pic banner")
    .populate("createdAt.stringValue")
    .sort("-createdAt")
    .then((mypost) => {
      res.json({ mypost });
    })
    .catch((err) => {
      console.log(err);
    });
};

export const like = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id username fullname pic banner")
    .populate("comments.postedBy", "_id username fullname pic banner")
    .exec((err, result) => {
      if (err) {
        res.status(400).json({ error: err });
      } else {
        res.status(200).json(result);
      }
    });
};

export const unlike = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id username fullname pic banner")
    .populate("comments.postedBy", "_id username fullname pic banner")
    .exec((err, result) => {
      if (err) {
        res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
};

export const comment = (req, res) => {
  console.log("server like", req);
  const comments = {
    text: req.body.text,
    postedBy: req.user._id,
  };
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comments },
    },
    {
      new: true,
    }
  )
    .populate("postedBy", "_id username fullname pic banner")
    .populate("comments.postedBy", "_id username fullname pic banner")
    .exec((err, result) => {
      if (err) {
        res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
};

export const deletepost = (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(422).json({ error: err });
      }
      if (post.postedBy._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            res.json(result);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
};
