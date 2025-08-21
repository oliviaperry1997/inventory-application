const { Router } = require("express");
const pokemonController = require("../controllers/pokemonController");

const pokemonRouter = Router();

pokemonRouter.get("/", pokemonController.mainPageGet);
pokemonRouter.get("/:id/view", pokemonController.viewTrainerGet);
pokemonRouter.get("/create", pokemonController.createTrainerGet);
pokemonRouter.post("/create", pokemonController.createTrainerPost);

module.exports = pokemonRouter;
