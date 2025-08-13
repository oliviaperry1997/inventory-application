require("dotenv").config();

const { Client } = require("pg");

async function getAllPokemonData() {
    const pokeListRes = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=1025"
    );
    const pokeList = (await pokeListRes.json()).results;

    const results = [];
    const batchSize = 20;

    for (let i = 0; i < pokeList.length; i += batchSize) {
        const batch = pokeList.slice(i, i + batchSize);

        const batchResults = await Promise.all(
            batch.map(async (p) => {
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        const pokeRes = await fetch(p.url);
                        if (!pokeRes.ok)
                            throw new Error(`HTTP ${pokeRes.status}`);
                        const poke = await pokeRes.json();

                        return {
                            id: poke.id,
                            name: poke.species.name,
                            types: poke.types.map((t) => t.type.name),
                            sprite: poke.sprites.front_default,
                        };
                    } catch (err) {
                        console.warn(
                            `Failed to fetch ${p.name} (Attempt ${attempt}): ${err}`
                        );
                        if (attempt === 3) return null;
                        await new Promise((res) =>
                            setTimeout(res, 500 * attempt)
                        );
                    }
                }
            })
        );

        results.push(...batchResults.filter(Boolean));
        console.log(`Fetched ${results.length} Pokémon so far...`);
    }

    return results;
}

async function populatedb(client) {
    const pokemon = await getAllPokemonData();
    console.log(`✅ Done! Got ${pokemon.length} Pokémon.`);

    const typeList = [
        "normal",
        "fire",
        "water",
        "grass",
        "electric",
        "ice",
        "fighting",
        "poison",
        "ground",
        "flying",
        "psychic",
        "bug",
        "rock",
        "ghost",
        "dragon",
        "dark",
        "steel",
        "fairy",
    ];

    const trainerSprites = [
        {name: "DPPt Ace Trainer F 1", sprite: "Spr_DP_Ace_Trainer_F_1.png"},
        {name: "DPPt Ace Trainer M 1", sprite: "Spr_DP_Ace_Trainer_M_1.png"},
        {name: "DPPt Ace Trainer F 2", sprite: "Spr_DP_Ace_Trainer_F_2.png"},
        {name: "DPPt Ace Trainer M 2", sprite: "Spr_DP_Ace_Trainer_M_2.png"},
        {name: "DPPt Aroma Lady", sprite: "Spr_DP_Aroma_Lady.png"},
        {name: "DPPt Artist", sprite: "Spr_DP_Artist.png"},
        {name: "DPPt Battle Girl", sprite: "Spr_DP_Battle_Girl.png"},
        {name: "DPPt Beauty", sprite: "Spr_DP_Beauty.png"},
        {name: "DPPt Bird Keeper", sprite: "Spr_DP_Bird_Keeper.png"},
        {name: "DPPt Black Belt", sprite: "Spr_DP_Black_Belt.png"},
        {name: "DPPt Bug Catcher", sprite: "Spr_DP_Bug_Catcher.png"},
        {name: "DPPt Cameraman", sprite: "Spr_DP_Cameraman.png"},
        {name: "DPPt Camper", sprite: "Spr_DP_Camper.png"},
        {name: "DPPt Clown", sprite: "Spr_DP_Clown.png"},
        {name: "DPPt Collector", sprite: "Spr_DP_Collector.png"},
        {name: "DPPt Cowgirl", sprite: "Spr_DP_Cowgirl.png"},
        {name: "DPPt Cyclist F", sprite: "Spr_DP_Cyclist_F.png"},
        {name: "DPPt Cyclist M", sprite: "Spr_DP_Cyclist_M.png"},
        {name: "DPPt Dragon Tamer", sprite: "Spr_DP_Dragon_Tamer.png"},
        {name: "DPPt Fisherman", sprite: "Spr_DP_Fisherman.png"},
        {name: "DPPt Galactic Grunt F", sprite: "Spr_DP_Galactic_Grunt_F.png"},
        {name: "DPPt Galactic Grunt M", sprite: "Spr_DP_Galactic_Grunt_M.png"},
        {name: "DPPt Gentleman", sprite: "Spr_DP_Gentleman.png"},
        {name: "DPPt Guitarist", sprite: "Spr_DP_Guitarist.png"},
        {name: "DPPt Hiker", sprite: "Spr_DP_Hiker.png"},
        {name: "DPPt Idol", sprite: "Spr_DP_Idol.png"},
        {name: "DPPt Jogger", sprite: "Spr_DP_Jogger.png"},
        {name: "DPPt Lady", sprite: "Spr_DP_Lady.png"},
        {name: "DPPt Lass", sprite: "Spr_DP_Lass.png"},
        {name: "DPPt Maid", sprite: "Spr_Pt_Maid.png"},
        {name: "DPPt Ninja Boy", sprite: "Spr_DP_Ninja_Boy.png"},
        {name: "DPPt Officer", sprite: "Spr_DP_Officer.png"},
        {name: "DPPt Parasol Lady", sprite: "Spr_DP_Parasol_Lady.png"},
        {name: "DPPt PI", sprite: "Spr_DP_PI.png"},
        {name: "DPPt Picnicker", sprite: "Spr_DP_Picnicker.png"},
        {name: "DPPt Poké Kid", sprite: "Spr_DP_Poké_Kid.png"},
        {name: "DPPt Pokéfan F", sprite: "Spr_DP_Pokéfan_F.png"},
        {name: "DPPt Pokéfan M", sprite: "Spr_DP_Pokéfan_M.png"},
        {name: "DPPt Pokémon Breeder F", sprite: "Spr_DP_Pokémon_Breeder_F.png"},
        {name: "DPPt Pokémon Breeder M", sprite: "Spr_DP_Pokémon_Breeder_M.png"},
        {name: "DPPt Pokémon Ranger F", sprite: "Spr_DP_Pokémon_Ranger_F.png"},
        {name: "DPPt Pokémon Ranger M", sprite: "Spr_DP_Pokémon_Ranger_M.png"},
        {name: "DPPt Psychic F", sprite: "Spr_DP_Psychic_F.png"},
        {name: "DPPt Psychic M", sprite: "Spr_DP_Psychic_M.png"},
        {name: "DPPt Rancher", sprite: "Spr_DP_Rancher.png"},
        {name: "DPPt Reporter", sprite: "Spr_DP_Reporter.png"},
        {name: "DPPt Rich Boy", sprite: "Spr_DP_Rich_Boy.png"},
        {name: "DPPt Roughneck", sprite: "Spr_DP_Roughneck.png"},
        {name: "DPPt Ruin Maniac", sprite: "Spr_DP_Ruin_Maniac.png"},
        {name: "DPPt Sailor", sprite: "Spr_DP_Sailor.png"},
        {name: "DPPt School Kid F", sprite: "Spr_DP_School_Kid_F.png"},
        {name: "DPPt School Kid M", sprite: "Spr_DP_School_Kid_M.png"},
        {name: "DPPt Scientist", sprite: "Spr_DP_Scientist.png"},
        {name: "DPPt Skier F", sprite: "Spr_DP_Skier_F.png"},
        {name: "DPPt Skier M", sprite: "Spr_DP_Skier_M.png"},
        {name: "DPPt Socialite", sprite: "Spr_DP_Socialite.png"},
        {name: "DPPt Swimmer F", sprite: "Spr_DP_Swimmer_F.png"},
        {name: "DPPt Swimmer M", sprite: "Spr_DP_Swimmer_M.png"},
        {name: "DPPt Tuber F", sprite: "Spr_DP_Tuber_F.png"},
        {name: "DPPt Tuber M", sprite: "Spr_DP_Tuber_M.png"},
        {name: "DPPt Veteran", sprite: "Spr_DP_Veteran.png"},
        {name: "DPPt Waiter", sprite: "Spr_DP_Waiter.png"},
        {name: "DPPt Waitress", sprite: "Spr_DP_Waitress.png"},
        {name: "DPPt Worker", sprite: "Spr_DP_Worker.png"},
        {name: "DPPt Youngster", sprite: "Spr_DP_Youngster.png"},
        {name: "HGSS Ace Trainer F", sprite: "Spr_HGSS_Ace_Trainer_F.png"},
        {name: "HGSS Ace Trainer M", sprite: "Spr_HGSS_Ace_Trainer_M.png"},
        {name: "HGSS Beauty", sprite: "Spr_HGSS_Beauty.png"},
        {name: "HGSS Biker", sprite: "Spr_HGSS_Biker.png"},
        {name: "HGSS Bird Keeper", sprite: "Spr_HGSS_Bird_Keeper.png"},
        {name: "HGSS Black Belt", sprite: "Spr_HGSS_Black_Belt.png"},
        {name: "HGSS Boarder", sprite: "Spr_HGSS_Boarder.png"},
        {name: "HGSS Bug Catcher", sprite: "Spr_HGSS_Bug_Catcher.png"},
        {name: "HGSS Burglar", sprite: "Spr_HGSS_Burglar.png"},
        {name: "HGSS Firebreather", sprite: "Spr_HGSS_Firebreather.png"},
        {name: "HGSS Gentleman", sprite: "Spr_HGSS_Gentleman.png"},
        {name: "HGSS Juggler", sprite: "Spr_HGSS_Juggler.png"},
        {name: "HGSS Kimono Girl", sprite: "Spr_HGSS_Kimono_Girl.png"},
        {name: "HGSS Lass", sprite: "Spr_HGSS_Lass.png"},
        {name: "HGSS Medium", sprite: "Spr_HGSS_Medium.png"},
        {name: "HGSS Poké Maniac", sprite: "Spr_HGSS_Poké_Maniac.png"},
        {name: "HGSS Rocket Grunt F", sprite: "Spr_HGSS_Rocket_Grunt_F.png"},
        {name: "HGSS Rocket Grunt M", sprite: "Spr_HGSS_Rocket_Grunt_M.png"},
        {name: "HGSS Sage", sprite: "Spr_HGSS_Sage.png"},
        {name: "HGSS School Kid", sprite: "Spr_HGSS_School_Kid.png"},
        {name: "HGSS Scientist", sprite: "Spr_HGSS_Scientist.png"},
        {name: "HGSS Skier", sprite: "Spr_HGSS_Skier.png"},
        {name: "HGSS Super Nerd", sprite: "Spr_HGSS_Super_Nerd.png"},
        {name: "HGSS Swimmer F", sprite: "Spr_HGSS_Swimmer_F.png"},
        {name: "HGSS Swimmer M", sprite: "Spr_HGSS_Swimmer_M.png"},
        {name: "HGSS Teacher", sprite: "Spr_HGSS_Teacher.png"},
        {name: "HGSS Youngster", sprite: "Spr_HGSS_Youngster.png"}
    ]

    //create types table
    await client.query(`
        CREATE TABLE IF NOT EXISTS types (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name TEXT UNIQUE NOT NULL,
            icon TEXT
        );
    `);

    //create pokemon table
    await client.query(`
        CREATE TABLE IF NOT EXISTS pokemon (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name TEXT,
            type1_id INTEGER NOT NULL REFERENCES types(id),
            type2_id INTEGER REFERENCES types(id),
            sprite TEXT
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS trainer_sprites (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name TEXT,
            sprite TEXT
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS trainers (
            id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
            name TEXT,
            pokemon1 INTEGER NOT NULL REFERENCES pokemon(id),
            pokemon2 INTEGER REFERENCES pokemon(id),
            pokemon3 INTEGER REFERENCES pokemon(id),
            pokemon4 INTEGER REFERENCES pokemon(id),
            pokemon5 INTEGER REFERENCES pokemon(id),
            pokemon6 INTEGER REFERENCES pokemon(id),
            sprite INTEGER REFERENCES trainer_sprites(id)
        );
    `);

    //populate types
    for (const typeName of typeList) {
        try {
            const typeRes = await fetch(
                `https://pokeapi.co/api/v2/type/${typeName}`
            );
            if (!typeRes.ok) throw new Error(`HTTP ${typeRes.status}`);

            const typeData = await typeRes.json();
            const iconUrl =
                typeData.sprites?.["generation-viii"]?.[
                    "brilliant-diamond-and-shining-pearl"
                ]?.["name_icon"] || null;

            await client.query(
                `INSERT INTO types (name, icon) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
                [typeName, iconUrl]
            );
        } catch (err) {
            console.warn(`Failed to fetch type ${typeName} icon: ${err}`);
            // Insert without icon on failure
            await client.query(
                `INSERT INTO types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
                [typeName]
            );
        }
    }

    //populate pokemon
    for (const p of pokemon) {
        const type1 = await client.query(
            "SELECT id FROM types WHERE name = $1",
            [p.types[0]]
        );
        const type2 = p.types[1]
            ? await client.query("SELECT id FROM types WHERE name = $1", [
                  p.types[1],
              ])
            : null;

        await client.query(
            `
            INSERT INTO pokemon (name, type1_id, type2_id, sprite)
            VALUES ($1, $2, $3, $4);
            `,
            [
                p.name,
                type1.rows[0].id,
                type2 ? type2.rows[0].id : null,
                p.sprite,
            ]
        );
    }

    //populate trainer sprites
    for (const s of trainerSprites) {
        await client.query(`
            INSERT INTO trainer_sprites (name, sprite)
            VALUES ($1, $2);
            `,
            [
                s.name,
                s.sprite,
            ]
        )
    }

    console.log("Database population complete!");
}

async function main() {
    console.log("seeding...");
    const connectionString = `postgresql://${encodeURIComponent(
        process.env.DB_USER
    )}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${
        process.env.DB_PORT
    }/${process.env.DB_NAME}`;
    console.log("Using connection string:", connectionString);
    const client = new Client({ connectionString });
    await client.connect();
    await populatedb(client);
    await client.end();
    console.log("done");
}

main();
