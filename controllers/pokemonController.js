const db = require("../db/queries");

async function mainPageGet(req, res) {
    const rows = await db.getAllTrainers();

    const trainers = rows.map((r) => ({
        id: r.id,
        name: r.name,
        sprite: {
            sprite: r.sprite_path,
            name: r.sprite_name,
        },
        team: (r.pokemon_team || []).map((p) => ({
            name: p.name,
            sprite: p.sprite,
            types: [p.type1, p.type2].filter(Boolean),
        })),
    }));

    console.log(trainers);

    res.render("index", { title: "All Trainers", trainers });
}

async function viewTrainerGet(req, res) {
    const trainer = await db.getOneTrainer(req.params.id);
    res.render("trainer", { title: "View Trainer", trainer: trainer });
}

async function createTrainerGet(req, res) {
    const pokemon = await db.getAllPokemon();
    console.log(pokemon);
    const trainerSprites = await db.getAllTrainerSprites();
    res.render("createTrainer", {
        title: "Create Trainer",
        pokemon: pokemon,
        trainerSprites: trainerSprites,
    });
}

async function createTrainerPost(req, res) {
    let {
        name,
        pokemon1,
        pokemon2,
        pokemon3,
        pokemon4,
        pokemon5,
        pokemon6,
        sprite,
    } = req.body;

    pokemon1 = pokemon1 || null;
    pokemon2 = pokemon2 || null;
    pokemon3 = pokemon3 || null;
    pokemon4 = pokemon4 || null;
    pokemon5 = pokemon5 || null;
    pokemon6 = pokemon6 || null;

    db.createNewTrainer(
        name,
        pokemon1,
        pokemon2,
        pokemon3,
        pokemon4,
        pokemon5,
        pokemon6,
        sprite
    );

    res.redirect("/");
}

module.exports = {
    mainPageGet,
    viewTrainerGet,
    createTrainerGet,
    createTrainerPost,
};
