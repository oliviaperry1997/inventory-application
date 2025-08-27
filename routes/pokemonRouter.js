const { Router } = require("express");
const pokemonController = require("../controllers/pokemonController");

const pokemonRouter = Router();

pokemonRouter.get("/", pokemonController.mainPageGet);
pokemonRouter.get("/:id/view", pokemonController.viewTrainerGet);
pokemonRouter.get("/create", pokemonController.createTrainerGet);
pokemonRouter.post("/create", pokemonController.createTrainerPost);
pokemonRouter.get("/:id/update", pokemonController.updateTrainerGet);
pokemonRouter.post("/:id/update", pokemonController.updateTrainerPost);

module.exports = pokemonRouter;
