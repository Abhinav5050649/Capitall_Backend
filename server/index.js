const express = require(`express`)
const cors = require(`cors`)
const app = express()
const connectToMongo = require("./dbConfig/dbConfig")
require('dotenv').config();
const port = process.env.PORT;

connectToMongo();

app.use(express.json());
app.use(cors());

app.use("/api/auth", require("./routes/auth/userAuth"));
app.use("/api/items", require("./routes/items/itemCRUD"));

app.get("/", (req, res) => {
    try {
        return res.status(200).send("Test!");
    } catch (error) {
        return res.status(500).send("Internal Server Error!");
    }
});

app.listen((port) => {
    console.log(`App listening on PORT: ${port}!`);
});