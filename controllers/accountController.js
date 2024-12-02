const utilities = require("../utilities/index");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver account page view
 * *************************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function buildAccountPage(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/account", {
        title: "Account Page",
        nav,
    });
}

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

    // This hashes the password for security
    let hashedPassword;
    try {
        // await is not needed, but the course includes it
        hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
        req.flash(
            "error",
            "Sorry, there was an error processing the registration"
        );
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
        });
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
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

/* ****************************************
 *  Process login request
 * ************************************ */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
async function accountLogin(req, res) {
    const nav = await utilities.getNav();
    const { account_email, account_password } = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData) {
        req.flash("error", "Please check your credentials and try again");
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            account_email,
        });
        return;
    }

    try {
        if (
            await bcrypt.compare(account_password, accountData.account_password)
        ) {
            const hourInMiliseconds = 1000 * 60 * 60;
            delete accountData.account_password;
            const accessToken = jwt.sign(
                accountData,
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: hourInMiliseconds }
            );
            if (process.env.NODE_ENV === "development") {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    maxAge: hourInMiliseconds,
                });
            } else {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    secure: true,
                    maxAge: hourInMiliseconds,
                });
            }
            return res.redirect("/account/");
        } else {
            req.flash("error", "Please check your credentials and ty again");
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                account_email,
            });
        }
    } catch (error) {
        throw new Error("Access Forbidden");
    }
}

module.exports = {
    buildLogin,
    buildRegistration,
    registerAccount,
    accountLogin,
    buildAccountPage,
};
