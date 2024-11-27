const utilities = require("../utilities/index");
const accountModel = require("../models/account-model");

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
        errors: null,
    });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function registerAccount(req, res) {
    let nav = await utilities.getNav();
    const {
        account_firstname,
        account_lastname,
        account_email,
        account_password,
    } = req.body;

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    );

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you're registered ${account_firstname}. Please log in.`
        );
        res.status(201).render("account/login", {
            title: "Login",
            nav,
        });
    } else {
        req.flash("error", "Sorry, the registration failed.");
        res.status(501).render("account/registration", {
            title: "Registration",
            nav,
        });
    }
}

module.exports = { buildLogin, buildRegistration, registerAccount };
