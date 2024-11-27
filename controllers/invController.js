const invModel = require("../models/inventory-model");
const utilities = require("../utilities/index");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(
        classification_id
    );

    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();

    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: `${className} vehicles`,
        nav,
        grid,
    });
};

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.buildInventoryItem = async function (req, res, next) {
    const inv_id = req.params.invId;
    // on this case the data is an object (not array)
    const data = await invModel.getInventoryItemById(inv_id);

    const details = utilities.buildInventoryDetails(data);
    const nav = await utilities.getNav();

    res.render("./inventory/item", {
        title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
        nav,
        details,
    });
};

// 8888888                           888b     d888                                     888
//   888                             8888b   d8888                                     888
//   888                             88888b.d88888                                     888
//   888    88888b.   888  888       888Y88888P888  88888b.    .d88b.   88888b.d88b.   888888
//   888    888 "88b  888  888       888 Y888P 888  888 "88b  d88P"88b  888 "888 "88b  888
//   888    888  888  Y88  88P       888  Y8P  888  888  888  888  888  888  888  888  888
//   888    888  888   Y8bd8P        888   "   888  888  888  Y88b 888  888  888  888  Y88b.
// 8888888  888  888    Y88P         888       888  888  888   "Y88888  888  888  888   "Y888
//                                                                 888
//                                                            Y8b d88P
//                                                             "Y88P"

// Inventory management view
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.buildInventoryManagement = async function (req, res, next) {
    const nav = await utilities.getNav();

    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
    });
};

// Add classification view
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.buildAddClassification = async function (req, res, next) {
    const nav = await utilities.getNav();

    res.render("./inventory/add-classification", {
        title: "Add Inventory Classification",
        nav,
    });
};

// Create Classification Form handling (post request)
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.createClassification = async function (req, res, next) {
    let nav = await utilities.getNav();
    const { classification_name } = req.body;

    const insertResult = await invModel.insertClassificationCategory(
        classification_name
    );

    if (insertResult) {
        let newNav = await utilities.getNav();

        req.flash(
            "notice",
            `The classification ${classification_name} was created succesfully`
        );
        res.status(201).render("inventory/management", {
            title: "Inventory Management",
            nav: newNav,
        });
    } else {
        req.flash("error", "Sorry, the creation of the classification failed.");
        res.status(501).render("./inventory/add-classification", {
            title: "Add Inventory Classification",
            nav,
        });
    }
};

// Show add vehicle form view
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.buildAddVehicle = async function (req, res, next) {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationSelect()

    res.render("./inventory/add-inventory", {
        title: "Add Vehicle to Inventory",
        nav,
        classificationSelect
    });
};

module.exports = invCont;
