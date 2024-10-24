const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");
dotenv.config({path:"./.env"});

mongoose.connect(process.env.CONN_STR)
.then(()=>{
  console.log("Connected to database");
}).catch((error)=>{
  console.log(error);
});

const port = process.env.PORT || 3001;

app.listen(port,()=>{
  console.log("Server is running on port " + port);
});

