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
invCont.buildInventoryManagement = async function (req, res, next) {
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

module.exports = invCont;
