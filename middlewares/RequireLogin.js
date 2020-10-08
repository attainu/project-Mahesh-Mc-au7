import jsonwebtoken from "jsonwebtoken";
const verify = jsonwebtoken.verify;
const JWT_KEY = process.env.JWT_KEY;
import User from "../models/user.js";

export default (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res
      .status(401)
      .json({ error: "you must be logged in to access this page" });
  }
  const token = authorization.replace("Bearer ", "");
  verify(token, JWT_KEY, (err, payload) => {
    if (err) {
      return res
        .status(401)
        .json({ error: "you must be logged in to access this page" });
    }
    const { _id } = payload;
    User.findById(_id).then((userData) => {
      req.user = userData;
      next();
    });
  });
};
