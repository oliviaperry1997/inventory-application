const db = require("../db/queries");

async function mainPageGet(req, res) {
    const trainers = await db.getAllTrainers();
    console.log(trainers);
    res.render("index", {title: "All Trainers", trainers: trainers})
}

module.exports = {
    mainPageGet,
}