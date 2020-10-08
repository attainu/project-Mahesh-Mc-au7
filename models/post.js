import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const postSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: false,
    },
    media: {
      type: String,
      default: "N/a",
    },
    likes: [{ type: ObjectId, ref: "User" }],
    comments: [
      {
        text: String,
        postedBy: { type: ObjectId, ref: "User" },
        created_at: { type: Date, required: true, default: Date.now },
      },
    ],
    tags: [{ name: String, slug: String }],
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
