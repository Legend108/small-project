import connect from "./connections/connection";
import express from "express";
import passport from "passport";
import config from "../google.config.json";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import user from "./models/user";
import logger from "./utils/winston";

logger.debug("Logger ready");

const app = express();
connect();
passport.serializeUser(function (user: any, done: Function) {
  done(null, user);
});

passport.deserializeUser(function (obj: Object, done: Function) {
  done(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: config.cbUrl,
      passReqToCallback: true,
    },
    async function (
      request: any,
      accessToken: any,
      refreshToken: any,
      profile: any,
      done: Function
    ) {
      const e: any = await user.findOne({
        email: profile.email,
      });

      console.log(profile.email, e);

      if (e) {
        process.nextTick(function () {
          return done(null, profile);
        });
      } else if (!e) {
        await user.create({
          email: profile.email,
          name: profile.given_name,
        });
        console.log("Account made", e);
        process.nextTick(function () {
          return done(null, profile);
        });
      }
    }
  )
);

app.set("view engine", "ejs");

app.use(
  session({
    secret: "somesecrethere",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(passport.initialize());

app.use(passport.session());

app.get(
  "/api/google",
  passport.authenticate("google", {
    scope: ["email", "profile"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failed",
    successRedirect: "/home",
  })
);

app.get("/", (req: any, res: any) => {
  res.sendFile("/views/index.html", {
    root: process.cwd(),
  });
});

app.get("/home", async(req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) return res.redirect("/");

  const username: any = await user.findOne({
      email: req.user.email,
  });

  res.render("dash", {
    username: username.name,
  });
});

app.get("/profile", async (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) return res.redirect("/");
  // console.log(req.user);
  const u: any = await user.findOne({
    email: req.user.email,
  });

  var gender;
  if (u) {
    if (u.gender) {
      gender = gender;
    } else {
      gender = "none";
    }
  }

  res.render("profile", {
    name: u.name,
    email: u.email,
    gender: u.gender,
  });
});

app.get("/api/css", (req: any, res: any) => {
  res.sendFile("/api/css/main.css", { root: process.cwd() });
});

app.post("/api/profile", async (req: any, res: any) => {
  console.log(req.user.email);
  if (!req.isAuthenticated()) return res.redirect("/");
  if (!req.body || !req.body.username || !req.body.gender)
    return res.redirect("/profile");
  const body = req.body;
  let gender;
  if (body.gender == "1") {
    gender = "Male";
  } else if (body.gender == "2") {
    gender = "Female";
  } else if (body.gender == "3") {
    gender = "Other";
  } else if(body.gender == "4") {
      gender = "Wont Share :("
  }

  console.log(body.username);
  const r = await user.findOneAndUpdate(
    {
      email: req.user.email,
    },
    {
      name: body.username,
      gender: gender,
      email: req.user.email,
    },
    {
      upsert: true,
    }
  );

  return res.redirect("/profile");
});

app.listen(3001, () => {
  return console.log("Listening at port : %d in : %s mode");
});
