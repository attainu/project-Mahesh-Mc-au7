import User from "../models/user.js";

import Token from "../models/token.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/index.js";

export const signup = async (req, res) => {
  const { fullname, username, email, password } = req.body;
  if (!fullname || !username || !email || !password) {
    return res.status(422).json({
      error: "* Please complete all fields before attempting to signup *",
    });
  }
  try {
    User.findOne({ email: email }).then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: "An account with that email already exists" });
      }
      User.findOne({ username: username }).then((savedUser) => {
        if (savedUser) {
          return res
            .status(422)
            .json({ error: "An account with that username already exists" });
        }
        bcrypt.hash(password, 13).then((hasedPassword) => {
          const user = new User({
            fullname,
            username,
            email,
            password: hasedPassword,
          });
          user
            .save()
            .then((user) => {
              sendVerificationEmail(user, req, res);
            })
            .catch((err) => {
              console.log(err);
            });
        });
      }).catch;
    }).catch;
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: error.message, message: "failed" });
  }
};

export const signin = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username && !email) {
    return res
      .status(422)
      .json({ error: "A username or email is required to login" });
  }
  if ((!username && email && !password) || (username && !email && !password)) {
    return res.status(422).json({ error: "Please provide password" });
  }

  if (
    !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      username
    )
  ) {
    User.findOne({ username: username }).then((savedUser) => {
      if (!savedUser) {
        return res.status(422).json({
          error:
            "The username and password you entered did not match our records. Please double-check and try again.1",
        });
      }
      if (!savedUser.isVerified) {
        return res.status(422).json({
          error:
            "This Account is not verified Please Check your email to Verify it.",
        });
      }
      bcrypt
        .compare(password, savedUser.password)
        .then((passwordMatch) => {
          if (passwordMatch) {
            const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_KEY);
            const {
              _id,
              username,
              email,
              fullname,
              followers,
              following,
              pic,
              banner,
            } = savedUser;
            res.json({
              token,
              user: {
                _id,
                username,
                email,
                fullname,
                followers,
                following,
                pic,
                banner,
              },
            });
          } else {
            return res.status(422).json({
              error:
                "The username and password you entered did not match our records. Please double-check and try again.2",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  } else {
    User.findOne({ email: email }).then((savedUser) => {
      if (!savedUser) {
        return res.status(422).json({
          error:
            "The username and password you entered did not match our records. Please double-check and try again.3",
        });
      }
      if (!savedUser.isVerified) {
        return res.status(422).json({
          error:
            "This Account is not verified Please Check your email to Verify it.",
        });
      }
      bcrypt
        .compare(password, savedUser.password)
        .then((passwordMatch) => {
          if (passwordMatch) {
            const token = jwt.sign({ _id: savedUser._id }, JWT_KEY);
            const {
              _id,
              username,
              email,
              fullname,
              followers,
              following,
              pic,
              banner,
            } = savedUser;
            res.json({
              token,
              user: {
                _id,
                username,
                email,
                fullname,
                followers,
                following,
                pic,
                banner,
              },
            });
          } else {
            return res.json({
              error:
                "The username and password you entered did not match our records. Please double-check and try again.4",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
};

export const verify = async (req, res) => {
  if (!req.params.token)
    return res
      .status(200)
      .json({ error: "We were unable to find a user for this token." });

  try {
    // Find a matching token
    const token = await Token.findOne({ token: req.params.token });
    if (!token)
      return res.status(200).json({
        error:
          "We were unable to find a valid token. Your token my have expired. Please Generate another",
      });

    // If we found a token, find a matching user
    User.findOne({ _id: token.userId }, (err, user) => {
      if (!user)
        return res
          .status(200)
          .json({ error: "We were unable to find a user for this token." });

      if (user.isVerified)
        return res
          .status(200)
          .json({ message: "This user has already been verified." });

      // Verify and save the user
      user.isVerified = true;
      user.save(function (error) {
        if (error) return res.status(500).json({ message: error.message });

        res.status(200).json({
          message: "The account has been verified. Please log in.",
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "failed" });
  }
};

export const resendToken = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({
        error:
          "The email address " +
          req.body.email +
          " is not associated with any account. Double-check your email address and try again.",
      });

    if (user.isVerified)
      return res.status(400).json({
        message: "This account has already been verified. Please log in.",
      });

    await sendVerificationEmail(user, req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const recover = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({
        error:
          "The email address " +
          req.body.email +
          " is not associated with any account. Double-check your email address and try again.",
      });

    //Generate and set password reset token
    user.generatePasswordReset();

    // Save the updated user object
    await user.save();

    // send email
    let subject = "Password change request";
    let to = user.email;
    let from = process.env.FROM_EMAIL;
    let link =
      "http://" + req.headers.host + "/users/reset/" + user.resetPasswordToken;
    let html = `<p>Hi ${user.username}</p>
                  <p>Please click on the following <a href="${link}">link</a> to reset your password.</p> 
                  <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

    await sendEmail({ to, from, subject, html });

    res.status(200).json({
      message: "A reset email has been sent to " + user.email + ".",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const reset = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(401).json({
        error: "Password reset token is invalid or has expired.",
      });

    //Redirect user to form with the email address
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(401).json({
        error: "Password reset token is invalid or has expired.",
      });

    //Set the new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.isVerified = true;

    // Save the updated user object
    await user.save();

    let subject = "Your password has been changed";
    let to = user.email;
    let from = process.env.FROM_EMAIL;
    let html = `<p>Hi ${user.username}</p>
                  <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>`;

    await sendEmail({ to, from, subject, html });

    res.status(200).json({ message: "Your password has been updated." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function sendVerificationEmail(user, req, res) {
  try {
    const token = user.generateVerificationToken();

    // Save the verification token
    await token.save();

    let subject = "Account Verification";
    let to = user.email;
    let from = process.env.FROM_EMAIL;
    //let link = "http://" + req.headers.host + "/verify/" + token.token;
    let link = "http://localhost:3000/verify/" + token.token;
    let html = `<p>Hi ${user.email}<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`;

    await sendEmail({ to, from, subject, html });

    res.status(200).json({
      message: "A verification email has been sent to " + user.email + ".",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "failed to send email" });
  }
}
