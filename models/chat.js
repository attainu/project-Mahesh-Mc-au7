import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    roomid: {
      type: String,
      required: true,
    },
    senderid: {
      type: String,
      required: true,
    },
    receiverid: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sendername: {
      type: String,
      required: true,
    },
    receivername: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
