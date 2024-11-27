const utilities = require("./index");
const { body, validationResult } = require("express-validator");
const validate = {};

/*  **********************************
 *  New Classification Data Validation Rules
 * ********************************* */
validate.createClassificationRules = () => {
    return [
        // classification name is required and must be a string
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a classification name."), // on error this message is sent.
    ];
};

/* ******************************
 * Check data and return errors or continue adding the data
 * ***************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns
 */
validate.checkNewClassificationData = async (req, res, next) => {
    const { classification_name } = req.body;
    let errors = validationResult(req);

    errors.array().forEach((x) => {
        req.flash("error", x.msg);
    });

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav();
        res.render("./inventory/add-classification", {
            title: "Add Inventory Classification",
            nav,
            classification_name,
        });
        return;
    }

    next();
};

module.exports = validate;
