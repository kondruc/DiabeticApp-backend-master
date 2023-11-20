require('dotenv').config();

const cors = require("cors");

const express = require("express");
const mongoose = require("mongoose");

const http = require("http");

mongoose.set("strictQuery", false);
const app = express();

app.use(express.json());
app.use(cors());

const hostname = process.env.HOSTNAME;
const port = process.env.PORT;
const uri = process.env.URI;
// const db_username = process.env.USERNAME;
// const db_password = process.env.PASSWORD;

// const server = http.createServer((req, res) => {
//   res.statusCode = 200;
//   res.setHeader("Content-Type", "text/plain");
//   res.end("Hello World");
// });

const userCarbsData = require("./routes/userCarbsRoute");
app.get("/", (req, res) => {
  res.send("Hello");
});
app.use("/api", userCarbsData);

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));

db.once("open", function () {
  console.log("MongoDB connected successfully");
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});
