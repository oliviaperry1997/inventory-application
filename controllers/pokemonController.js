const db = require("../db/queries");

async function mainPageGet(req, res) {
    res.render("index", {title: "Home"})
}

module.exports = {
    mainPageGet,
}