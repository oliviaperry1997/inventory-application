const { Router } = require("express");
const pokemonController = require("../controllers/pokemonController");

const pokemonRouter = Router();

pokemonRouter.get("/", pokemonController.mainPageGet);

module.exports = pokemonRouter;
