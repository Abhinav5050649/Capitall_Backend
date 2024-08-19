require('dotenv').config();
const express = require(`express`)
const cors = require(`cors`)
const app = express()
const connectToMongo = require("./dbConfig/dbConfig")
const port = process.env.PORT;
const cookieParser = require("cookie-parser");

connectToMongo();

app.use(express.json());
app.use(cors(
    "http://localhost:3000/"
));
app.use(cookieParser());

app.use("/api/auth", require("./routes/auth/userAuth"));
app.use("/api/items", require("./routes/items/itemCRUD"));

app.listen(port, () => {
    console.log(`App listening on PORT: ${port}!`);
});