const { Router } = require("express");
const pokemonController = require("../controllers/pokemonController");

const pokemonRouter = Router();

pokemonRouter.get("/", pokemonController.mainPageGet);
pokemonRouter.get("/:id", pokemonController.viewTrainerGet);

module.exports = pokemonRouter;
