const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS
app.use(cors());

const generateRoute = require("./routes/generate.route");

// API endpoint for generating content
app.use("/api", generateRoute);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
