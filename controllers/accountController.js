const utilities = require("../utilities/index");

/* ****************************************
 *  Deliver login view
 * *************************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
    });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function buildRegistration(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/registration", {
        title: "Registration",
        nav,
    });
}

module.exports = { buildLogin, buildRegistration };
