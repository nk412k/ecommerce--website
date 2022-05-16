const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const transpoter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: "Nokhalal412000@gmail.com",
    pass: "QS2kv6IwDTr3tUzg",
  },
});

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get("Cookie").split(";")[1].trim().split("=")[1];
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    title: "Login",
    isAuthenticated: false,
    isAdmin: false,
    errorMessage: message,
    validationError: [],
    oldValue: { email: "" },
  });
};

exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie','loggedIn=true');
  const email = req.body.email;
  const password = req.body.password;
  const error = validationResult(req);
  // console.log(error);
  if (!error.isEmpty()) {
    return res.render("auth/login", {
      path: "/login",
      title: "Login",
      isAuthenticated: false,
      isAdmin: false,
      errorMessage: error.array()[0].msg,
      validationError:error.array(),
      oldValue:{email:email}
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.render("auth/login", {
          path: "/login",
          title: "Login",
          isAuthenticated: false,
          isAdmin: false,
          errorMessage: "Email of password is invalid",
          validationError: [],
          oldValue: { email: email },
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (!match) {
            return res.render("auth/login", {
              path: "/login",
              title: "Login",
              isAuthenticated: false,
              isAdmin: false,
              errorMessage: "Email or password is invalid",
              validationError: [],
              oldValue: { email: email },
            });
          }
          if (user.email === "admin@admin.com") {
            req.session.admin = true;
          } else {
            req.session.admin = false;
          }
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(() => {
            res.redirect("/");
          });
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const error = validationResult(req);
  // console.log(error);
  if (!error.isEmpty()) {
    return res.render("auth/signup", {
      path: "/singup",
      title: "Sign Up",
      isAuthenticated: false,
      isAdmin: false,
      errorMessage: error.array()[0].msg,
      oldValue:{email:email},
      validationError:error.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const user = new User({
        email: email,
        password: hashPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transpoter.sendMail({
        to: email,
        from: "Shopping@Website.com",
        subject: "Signup succeeded",
        html: "<h1>You successfully sign up</h1>",
      });
    });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/singup",
    title: "Sign Up",
    isAuthenticated: false,
    isAdmin: false,
    errorMessage: message,
    oldValue: { email: '' },
    validationError: [],
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    title: "Reset",
    isAuthenticated: false,
    isAdmin: false,
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "No user with that email");
        return res.redirect("/reset");
      }
      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          console.log(err);
          return res.redirect("/reset");
        }
        const token = buffer.toString("hex");
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save().then((result) => {
          res.redirect("/login");
          return transpoter.sendMail({
            to: email,
            from: "Shopping@Website.com",
            subject: "Password Reset",
            html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="${req.protocol}://${req.get('host')}/reset/${token}">link</a> to set a new password</p>
          `,
          });
        });
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      req.flash("error", "Invalid password reset token");
      return res.redirect("/reset");
    }
    res.render("auth/new-password", {
      path: "/new-password",
      title: "Update Password",
      errorMessage: message,
      token: token,
      userId: user._id.toString(),
    });
  });
};

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  const newPassword = req.body.password;
  User.findOne({
    resetToken: passwordToken,
    _id: userId,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid password reset token");
        return res.redirect("/reset");
      }
      return bcrypt
        .hash(newPassword, 12)
        .then((hashPassword) => {
          user.password = hashPassword;
          user.resetToken = undefined;
          user.resetTokenExpiration = undefined;
          return user.save();
        })
        .then((result) => {
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
