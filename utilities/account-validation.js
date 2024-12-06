const utilities = require("./index");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");
const validate = {};

/*  **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
    return [
        // valid email is required
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required."),

        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ];
};

/* ******************************
 * Check data and return errors or continue to Login
 * ***************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors
            .array()
            .filter((x) => x.msg !== "Invalid value")
            .forEach((x) => {
                req.flash("error", x.msg);
            });
    }

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/login", {
            title: "Login",
            nav,
            account_email,
        });
        return;
    }

    next();
};

/*  **********************************
 *  Registration Data Validation Rules
 * ********************************* */
validate.registrationRules = () => {
    return [
        // firstname is required and must be a string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first Name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."),

        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(
                    account_email
                );
                if (emailExists) {
                    throw new Error(
                        "Email exists. Please log in or use different email"
                    );
                }
            }),

        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ];
};

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors
            .array()
            .filter((x) => x.msg !== "Invalid value")
            .forEach((x) => {
                req.flash("error", x.msg);
            });
    }

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("account/registration", {
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        });
        return;
    }

    next();
};

/*  **********************************
 *  Update account information Data Validation Rules
 * ********************************* */
validate.updateDataRules = () => {
    return [
        // firstname is required and must be a string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a last name."),

        // valid email is required and cannot already exist in the DB
        body("account_email")
            .trim()
            .escape()
            .notEmpty()
            .isEmail()
            .normalizeEmail()
            .withMessage("A valid email is required.")
            .custom(async (account_email, { req }) => {
                // This gets the account that has the email provided in the form
                // It could be the same account in the case that the email
                // was no changed
                const existingAccountWithNewEmail =
                    await accountModel.getAccountByEmail(account_email);

                const emailExists = existingAccountWithNewEmail.account_email;

                // using the req is probably really ugly
                // but it is the only way I found and it is late and i want to be done with this :)
                const isSameAccount =
                    existingAccountWithNewEmail.account_id ===
                    parseInt(req.body.account_id);

                if (emailExists && !isSameAccount) {
                    throw new Error(
                        "Email exists. Please use a different email"
                    );
                }
            }),
    ];
};

/* ******************************
 * Check data and return errors or continue to update account information
 * ***************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
validate.checkUpdateData = async (req, res, next) => {
    const { account_id, account_firstname, account_lastname, account_email } =
        req.body;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors
            .array()
            .filter((x) => x.msg !== "Invalid value")
            .forEach((x) => {
                req.flash("error", x.msg);
            });

        let nav = await utilities.getNav();

        res.render("account/update", {
            title: "Update Account Page",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_id,
        });
        return;
    }

    next();
};

/*  **********************************
 *  Update Password Validation Rules
 * ********************************* */
validate.updatePasswordRules = () => {
    return [
        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ];
};

/* ******************************
 * Check data and return errors or continue to update password
 * ***************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
validate.checkPasswordData = async (req, res, next) => {
    const { account_id } = req.body;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors
            .array()
            .filter((x) => x.msg !== "Invalid value")
            .forEach((x) => {
                req.flash("error", x.msg);
            });

        let nav = await utilities.getNav();

        res.redirect(302, `/account/update/${account_id}`);
        return;
    }

    next();
};

module.exports = validate;
