const express = require("express");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const globalErrorController = require("./controllers/globalErrorController");
const CustomError = require("./utils/customError");
const authRouter = require("./routes/authRoutes");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger-output.json");
const contactRoutes = require("./routes/contactRoutes");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config({path:"./.env"});

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json({limit:'50kb'}));
app.set("trust proxy", 1);
app.use(
  session({
    secret: "vamsisony",
    saveUninitialized: true,
    resave: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 10 * 60 * 1000,
    },
  })
);

app.use(cors())

const limiter = rateLimit({
  max: 10, 
  windowMs: 15 * 60 * 1000, 
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use("/auth",limiter,authRouter);
app.use("/contact",contactRoutes);

app.all("*",(req,res,next)=>{
  const error = new CustomError(`Specified ${req.originalUrl} path not found.`,404);
  return next(error);
});

app.use(globalErrorController)
module.exports = app;