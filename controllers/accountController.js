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
        isEmployee: utilities.isAuthorized(
            res.locals.accountData.account_type,
            "Employee"
        ),
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
            req.flash("error", "Please check your credentials and try again");
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

/* ****************************************
 *  Deliver account update page view
 * *************************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function buildAccountUpdatePage(req, res, next) {
    const accountId = parseInt(req.params.account_id);
    let nav = await utilities.getNav();

    const { account_firstname, account_lastname, account_email } =
        await accountModel.getAccountById(accountId);

    res.render("account/update", {
        title: "Update Account Page",
        nav,
        account_firstname,
        account_lastname,
        account_email,
        account_id: accountId,
    });
}

/* ****************************************
 *  Update account data
 * *************************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function updateAccountData(req, res, next) {
    let nav = await utilities.getNav();

    const account_id = parseInt(req.body.account_id);
    const { account_firstname, account_lastname, account_email } = req.body;

    const updateResult = await accountModel.updateAccount({
        account_firstname,
        account_lastname,
        account_email,
        account_id,
    });

    // This is just to check if there is data,
    // and we use the email because the id may be falsy
    if (updateResult.account_email) {
        req.flash(
            "notice",
            `Your account information was updated succesfully.`
        );

        const hourInMiliseconds = 1000 * 60 * 60;
        delete updateResult.account_password;
        const accessToken = jwt.sign(
            updateResult,
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

        return res.redirect(302, "/account/");
    } else {
        req.flash("error", "Sorry, the update failed.");

        return res.render("account/update", {
            title: "Update Account Page",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
        });
    }
}

/* ****************************************
 *  Update account password
 * *************************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function updateAccountPassword(req, res, next) {
    const account_id = parseInt(req.body.account_id);
    const { account_password } = req.body;

    try {
        // await is not needed, but the course includes it
        hashedPassword = await bcrypt.hashSync(account_password, 10);
    } catch (error) {
        req.flash("error", "Sorry, the update failed.");

        return res.redirect(302, `/account/update/${account_id}`);
    }

    const updateResult = await accountModel.updateAccountPassword({
        account_password: hashedPassword,
        account_id,
    });

    // This is just to check if there is data,
    // and we use the email because the id may be falsy
    if (updateResult.account_email) {
        req.flash("notice", `Your account password was updated succesfully.`);

        const hourInMiliseconds = 1000 * 60 * 60;
        delete updateResult.account_password;
        const accessToken = jwt.sign(
            updateResult,
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

        return res.redirect(302, "/account/");
    } else {
        req.flash("error", "Sorry, the update failed.");

        return res.redirect(302, `/account/update/${account_id}`);
    }
}

// Logout the user
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function logout(req, res, next) {
    // By deleting the cookie the user is logged out
    res.clearCookie("jwt");
    res.redirect(302, "/");
}

module.exports = {
    buildLogin,
    buildRegistration,
    registerAccount,
    accountLogin,
    buildAccountPage,
    buildAccountUpdatePage,
    updateAccountData,
    updateAccountPassword,
    logout,
};
