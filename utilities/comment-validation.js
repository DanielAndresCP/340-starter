const utilities = require("./index");
const accountModel = require("../models/account-model");
const invModel = require("../models/inventory-model");
const { body, validationResult } = require("express-validator");
const validate = {};
const commentModel = require("../models/comment-model");

validate.addCommentRules = () => {
    return [
        //(comment_text,comment_date,account_id,inv_id)
        // comment_text is required and must be a string
        body("comment_text")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Please provide a comment.")
            .isLength({ min: 1 })
            .withMessage("Please provide a comment."),

        // an existing account id must be provided
        body("account_id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("There was an error adding the comment.")
            .custom(async (account_id) => {
                const userExists = (
                    await accountModel.getAccountById(parseInt(account_id))
                ).account_email;

                if (!userExists) {
                    throw new Error(
                        "There was an error adding the comment, logging in again may fix it."
                    );
                }
            }),

        // an existing inv id must be provided
        body("inv_id")
            .trim()
            .notEmpty()
            .custom(async (inv_id) => {
                const invExists = (
                    await invModel.getInventoryItemById(parseInt(inv_id))
                ).inv_make;

                if (!invExists) {
                    throw new Error("There was an error adding the comment.");
                }
            }),
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
validate.checkAddCommentData = async (req, res, next) => {
    const { inv_id } = req.body;
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
        return res.redirect(`/inv/detail/${inv_id}`);
    }

    next();
};

validate.deleteCommentRules = () => {
    return [
        // an existing account id must be provided
        body("comment_id")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("There was an error deleting the comment.")
            .custom(async (comment_id) => {
                const commentExists = (
                    await commentModel.getCommentbyId(parseInt(comment_id))
                )?.comment_text;

                if (!commentExists) {
                    throw new Error(
                        "There was an error deleting the comment, it looks like it was already deleted."
                    );
                }
            }),

        // // an existing inv id must be provided
        // body("inv_id")
        //     .trim()
        //     .notEmpty()
        //     .custom(async (inv_id) => {
        //         const invExists = (
        //             await invModel.getInventoryItemById(parseInt(inv_id))
        //         ).inv_make;

        //         if (!invExists) {
        //             throw new Error("There was an error deleting the comment.");
        //         }
        //     }),
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
validate.checkDeleteCommentData = async (req, res, next) => {
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        // We send a json response because this is the api, not a view
        return res.json({
            hasErrors: true,
            errors: errors
                .array()
                .filter((x) => x.msg !== "Invalid value")
                .map((x) => x.msg),
        });
    }

    // if (!errors.isEmpty()) {
    //     return res.redirect(`/inv/detail/${inv_id}`);
    // }

    next();
};

module.exports = validate;
