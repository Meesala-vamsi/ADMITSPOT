const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "My API",
    description: "Description",
  },
  host: "localhost:5000",
};

const outputFile = "./swagger-output.json";
const routes = ["./routes/authRoutes.js","./routes/contactRoutes.js"];

swaggerAutogen(outputFile, routes, doc);
