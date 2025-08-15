const express = require("express");
const path = require("node:path");
const pokemonRouter = require("./routes/pokemonRouter");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use("/", pokemonRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})
