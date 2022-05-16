const express = require("express");

const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const User=require('../models/user');

const router = express.Router();

router.get("/login", authController.getLogin);

router.post(
  "/login",
  check("email").isEmail().withMessage("Enter valid Email"),
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.post(
  "/signup",
  [check("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter valid email")
    .custom((value, { req }) => {
        // if(value==='test@test.com'){
        //     throw new Error('this email is forbidden');
        // }
      return User.findOne({ email: value })
        .then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exist");
          }
          return true;
        })
    }),
    check('password','Password must be atleast of 5 letters').trim().isLength({min:5}),
    check('confirmPassword').custom((value,{req})=>{
        if(value.trim()!==req.body.password){
            throw Error("Password does match");
        }
        return true;
    })],
  authController.postSignup
);

router.get("/signup", authController.getSignup);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
