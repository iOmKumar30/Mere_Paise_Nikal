const express = require("express");
const mainRouter = require("./routes/index.js");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: 'https://mere-paise-nikal-backend.onrender.com/',
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));

app.use(express.json());

// Use the mainRouter for all routes under /api/v1
app.use("/api/v1", mainRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server is running on port 3000");
});
