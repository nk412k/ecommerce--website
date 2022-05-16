const express = require("express");
const path = require("path");
const fs=require('fs');
const bodyParser = require("body-parser");
const errorController = require("./controllers/error");
const User = require("./models/user");
const mongoose = require("mongoose");
const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Math.random() * 9999999 + "-" + file.originalname);
  },
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.grwrf.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

const store = new MongodbStore({
  uri: MONGO_URI,
  colletion: "session",
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const accesslog=fs.createWriteStream(path.join(__dirname,'access.log'),{
  flag:'a'
})

app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream:accesslog}));

const adminRoute = require("./routes/admin");
const shopRoute = require("./routes/shop");
const authRoute = require("./routes/auth");

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");


app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  multer({ storage: fileStorage, fileFilter: filefilter }).single("image")
);
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  res.locals.isAdmin = req.session.admin;
  next();
});
app.use((req, res, next) => {
  // throw new Error('dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((error) => {
      next(new Error(error));
    });
});

app.use(flash());
app.use("/admin", adminRoute);
app.use(shopRoute);
app.use(authRoute);
app.use(errorController.getError);

app.get("/500", errorController.get500);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("500", {
    title: "Error",
    path: "500",
    isAuthenticated: req.session.isLoggedIn,
    isAdmin: req.session.admin,
  });
});

mongoose
  .connect(MONGO_URI)
  .then((res) => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
