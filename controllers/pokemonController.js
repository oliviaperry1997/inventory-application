const db = require("../db/queries");

async function mainPageGet(req, res) {
    const trainers = await db.getAllTrainers();
    res.render("index", { title: "All Trainers", trainers: trainers });
}

async function viewTrainerGet(req, res) {
    const trainer = await db.getOneTrainer(req.params.id);
    res.render("trainer", { title: "View Trainer", trainer: trainer });
}

module.exports = {
    mainPageGet,
    viewTrainerGet,
};
