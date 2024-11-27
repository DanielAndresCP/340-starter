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
            .isLength({ min: 4, max: 4 }) // It has to be of exaclty 4 digits
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
            .custom((x) => {
                if (!x.includes(".") || !x.includes(".")) {
                    throw new Error("Image must contain a dot and slash");
                }
                return true;
            })
            .withMessage(
                "Please provide a valid image url (relative or absolute), it must be at least 3 characters long and include a dot (.) and a slash (/)."
            ),

        body("inv_thumbnail")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .custom((x) => {
                if (!x.includes(".") || !x.includes(".")) {
                    throw new Error("Thumbnail must contain a dot and slash");
                }
                return true;
            })
            .withMessage(
                "Please provide a valid thumbnail url (relative or absolute), it must be at least 3 characters long and include a dot (.) and a slash (/)."
            ),

        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .isNumeric({ no_symbols: true }) // It must be numeric, with no other symbols (., +, -)
            .withMessage(
                "Please provide a valid price, it must only contain numbers."
            ),

        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
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
    //TODO see if this is fixed after we do the team activity, currently we have to manually load the propertiues to locals
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

        // loading the locals:
        res.locals = {
            ...res.locals,
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
        };

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
        });
        return;
    }

    next();
};

module.exports = validate;
