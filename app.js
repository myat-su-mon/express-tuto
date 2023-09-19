const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);
// const mongoConnect = require("./util/database").mongoConnect;
const csrf = require("csurf");
const csrfProtection = csrf();
const flash = require("connect-flash");
const multer = require("multer");
const uuidv4 = require("uuid");

const MONGODB_URI =
  "mongodb+srv://root:root@cluster0.j30ddxo.mongodb.net/shop?retryWrites=true&w=majority";

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();
const store = new MongodbStore({
  uri: MONGODB_URI,
  collection: "sessions",
  // expires: 1000 * 60 * 60
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4.v4() + "-" + file.originalname);
  },
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    // cookie: {maxAge: 1000 * 60 * 60}
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  // throw new Error("sync error");
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      // throw new Error("dummy error");
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      // throw new Error(err);
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect("/500");
  res.status(500).render("500", {
    pageTitle: "Error",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log("MongoDB is connected");
    app.listen(3000, () => console.log("server listening on port 3000"));
  })
  .catch((err) => console.log(err));
