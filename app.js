require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

//route
const productRouter = require("./routes/productRouter");
const categoryRouter = require("./routes/categoryRouter");
const userRouter = require("./routes/userRouter");
const orderRouter = require("./routes/orderRouter");
const globalErrHandler = require("./middlewares/globalErrHandler");

app.use(cors());
app.options("*", cors());

//Middleware
app.use(express.json());
app.use(morgan("tiny"));

//Database connection
const db = process.env.CONNECTION_STRING;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "eshop-2",
  })
  .then(() => {
    console.log("DATABASE CONNECT");
  })
  .catch((err) => {
    console.log(err);
  });

const api = process.env.API_URL;

//routes
//Product Router
app.use(`${api}/products`, productRouter);

//Category Router
app.use(`${api}/categories`, categoryRouter);

//User Router
app.use(`${api}/users`, userRouter);

//Order Router
app.use(`${api}/orders`, orderRouter);

//Error handlers middleware
app.use(globalErrHandler);

//404 Error
app.use("*", (req, res) => {
  res.status(404).json({
    message: `${req.originalUrl} - Route Not Found`,
  });
});

//http://localhost:2023/api/v1/products
app.listen(2022, () => {
  console.log(`Serve is running on http://localhost:2022`);
});
