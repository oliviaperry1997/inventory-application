const pool = require("./pool");

async function getAllTrainers() {
    const query = `
        SELECT 
            t.id,
            t.name,
            ts.id AS sprite_id,
            ts.name AS sprite_name,
            ts.sprite AS sprite_path,
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', p.id,
                    'name', p.name,
                    'slot', v.slot,
                    'type1_id', p.type1_id,
                    'type1_name', t1.name,
                    'type2_id', p.type2_id,
                    'type2_name', t2.name,
                    'sprite', p.sprite
                )
                ORDER BY v.slot
            ) AS pokemon_team
        FROM trainers t
        JOIN trainer_sprites ts ON ts.id = t.sprite

        LEFT JOIN LATERAL (
            VALUES
                (t.pokemon1, 1),
                (t.pokemon2, 2),
                (t.pokemon3, 3),
                (t.pokemon4, 4),
                (t.pokemon5, 5),
                (t.pokemon6, 6)
        ) AS v(pokemon_id, slot) ON TRUE

        -- join pokemon
        LEFT JOIN pokemon p ON p.id = v.pokemon_id

        -- join types for type1 and type2
        LEFT JOIN types t1 ON t1.id = p.type1_id
        LEFT JOIN types t2 ON t2.id = p.type2_id

        GROUP BY t.id, ts.id
        ORDER BY t.id;
    `;

    const { rows } = await pool.query(query);
    console.log(rows);
    return rows;
}

async function getOneTrainer(id) {
    const { rows } = await pool.query(
        `
            SELECT 
                t.id,
                t.name,
                ts.id AS sprite_id,
                ts.name AS sprite_name,
                ts.sprite AS sprite_path,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', p.id,
                        'name', p.name,
                        'slot', v.slot,
                        'type1_id', p.type1_id,
                        'type1_name', t1.name,
                        'type2_id', p.type2_id,
                        'type2_name', t2.name,
                        'sprite', p.sprite
                    )
                    ORDER BY v.slot
                ) AS pokemon_team
            FROM trainers t
            JOIN trainer_sprites ts ON ts.id = t.sprite

            LEFT JOIN LATERAL (
                VALUES
                    (t.pokemon1, 1),
                    (t.pokemon2, 2),
                    (t.pokemon3, 3),
                    (t.pokemon4, 4),
                    (t.pokemon5, 5),
                    (t.pokemon6, 6)
            ) AS v(pokemon_id, slot) ON TRUE

            -- join pokemon
            LEFT JOIN pokemon p ON p.id = v.pokemon_id

            -- join types for type1 and type2
            LEFT JOIN types t1 ON t1.id = p.type1_id
            LEFT JOIN types t2 ON t2.id = p.type2_id

            WHERE t.id = $1
            GROUP BY t.id, ts.id
            ORDER BY t.id;
        `,
        [id]
    );

    return rows[0];
}

async function createNewTrainer(
    name,
    pokemon1,
    pokemon2,
    pokemon3,
    pokemon4,
    pokemon5,
    pokemon6,
    sprite
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
