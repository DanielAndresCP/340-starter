const utilities = require("../utilities/index.js");
const baseController = {};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
baseController.buildHome = async function (req, res) {
    const nav = await utilities.getNav();
    res.render("index", { title: "Home", nav });
};

module.exports = baseController;
