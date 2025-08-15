const pool = require("./pool");

async function getAllTrainers() {
    const { rows: trainers } = await pool.query("SELECT * FROM trainers;");
    const { rows: sprites } = await pool.query(
        "SELECT * FROM trainer_sprites;"
    );
    const { rows: pokemons } = await pool.query("SELECT * FROM pokemon;");
    const { rows: types } = await pool.query("SELECT * FROM types;");

    const fullTrainers = trainers.map((trainer) => {
        const sprite = sprites.find((s) => s.id === trainer.sprite);

        const team = [];
        for (let slot = 1; slot <= 6; slot++) {
            const pokemonId = trainer[`pokemon${slot}`];
            if (!pokemonId) continue;

            const pokemon = pokemons.find((p) => p.id === pokemonId);
            if (!pokemon) continue;

            const type1 = types.find((t) => t.id === pokemon.type1_id);
            const type2 = types.find((t) => t.id === pokemon.type2_id);

            team.push({
                name: pokemon.name,
                sprite: pokemon.sprite,
                types: [type1, type2].filter(Boolean),
            });
        }

        return {
            id: trainer.id,
            name: trainer.name,
            sprite,
            team,
        };
    });

    return fullTrainers;
}

async function getOneTrainer(id) {
    const { rows } = await pool.query("SELECT * FROM trainers WHERE id = $1;", [
        id,
    ]);
    const trainer = rows[0];
    if (!trainer) return null;
    const { rows: sprites } = await pool.query(
        "SELECT * FROM trainer_sprites;"
    );
    const { rows: pokemons } = await pool.query("SELECT * FROM pokemon;");
    const { rows: types } = await pool.query("SELECT * FROM types;");

    const sprite = sprites.find((s) => s.id === trainer.sprite);

    const team = [];
    for (let slot = 1; slot <= 6; slot++) {
        const pokemonId = trainer[`pokemon${slot}`];
        if (!pokemonId) continue;

        const pokemon = pokemons.find((p) => p.id === pokemonId);
        if (!pokemon) continue;

        const type1 = types.find((t) => t.id === pokemon.type1_id);
        const type2 = types.find((t) => t.id === pokemon.type2_id);

        team.push({
            name: pokemon.name,
            sprite: pokemon.sprite,
            types: [type1, type2].filter(Boolean),
        });
    }

    return {
        id: trainer.id,
        name: trainer.name,
        sprite,
        team,
    };
}

async function createNewTrainer(
    name,
    pokemon1,
    pokemon2,
    pokemon3,
    pokemon4,
    pokemon5,
    pokemon6,
    sprite,
) {
    await pool.query(
        `
            INSERT INTO trainers (name, pokemon1, pokemon2, pokemon3, pokemon4, pokemon5, pokemon6, sprite)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `,
        [
            name,
            pokemon1,
            pokemon2,
            pokemon3,
            pokemon4,
            pokemon5,
            pokemon6,
            sprite,
        ]
    );
}

async function getAllPokemon() {
    const { rows } = await pool.query("SELECT * FROM pokemon;");
    return rows;
}

async function getAllTrainerSprites() {
    const { rows } = await pool.query("SELECT * FROM trainer_sprites;");
    return rows;
}

module.exports = {
    getAllTrainers,
    getOneTrainer,
    createNewTrainer,
    getAllPokemon,
    getAllTrainerSprites,
};
