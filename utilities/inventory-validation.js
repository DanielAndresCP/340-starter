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

    errors
        .array()
        .filter((x) => x.msg !== "Invalid value")
        .forEach((x) => {
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

/*  **********************************
 *  New Vehicle Data Validation Rules
 * ********************************* */
validate.createVehicleRules = () => {
    return [
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a Make name."),

        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a Model name."),

        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 4 }) // It has to be of exaclty 4 digits
            .withMessage("Please provide a valid year (4 digits).")
            .isNumeric({ no_symbols: true }) // It must be numeric, with no other symbols (., +, -)
            .withMessage("Please provide a valid year (4 digit numeric)."),

        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 40 })
            .withMessage(
                "Please provide a valid description (40 characters minumun)."
            ),

        body("inv_image")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("The image path is too short to be valid")
            .unescape()
            .isURL({ require_protocol: false, require_host: false })
            .withMessage(
                "The image path is not a valid URL. The URL can be absolute or relative"
            )
            .contains(".")
            .withMessage(
                "Please provide a valid image path (it must include the extension)."
            ),

        body("inv_thumbnail")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("The thumbnail path is too short to be valid")
            .unescape()
            .isURL({ require_protocol: false, require_host: false })
            .withMessage(
                "The thumbnail path is not a valid URL. The URL can be absolute or relative"
            )
            .contains(".")
            .withMessage(
                "Please provide a valid thumbnail path (it must include the extension)."
            ),

        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a price.")
            .isNumeric({ no_symbols: true }) // It must be numeric, with no other symbols (., +, -)
            .withMessage(
                "Please provide a valid price, it must only contain numbers."
            ),

        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a mileage.")
            .isNumeric({ no_symbols: true }) // It must be numeric, with no other symbols (., +, -)
            .withMessage(
                "Please provide a valid mileage, it must only contain numbers."
            ),

        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a color."),

        body("classification_id")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 }) // TODO, add custom verification to see if the id exists?
            .withMessage("Please provide a classification."),
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
validate.checkNewVehicleData = async (req, res, next) => {
    const {
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        const classificationSelect = await utilities.buildClassificationSelect(
            classification_id
        );

        errors
            .array()
            .filter((x) => x.msg !== "Invalid value")
            .forEach((x) => {
                req.flash("error", x.msg);
            });

        let nav = await utilities.getNav();

        res.render("./inventory/add-inventory", {
            title: "Add Vehicle to Inventory",
            nav,
            classificationSelect,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        });
        return;
    }

    next();
};

module.exports = validate;
