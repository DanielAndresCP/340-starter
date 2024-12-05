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
    const classificationSelect = await utilities.buildClassificationSelect();
    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        classificationSelect,
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
    const classificationSelect = await utilities.buildClassificationSelect();

    res.render("./inventory/add-inventory", {
        title: "Add Vehicle to Inventory",
        nav,
        classificationSelect,
    });
};

// Create a vehicle (receiving post request)
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.createVehicle = async function (req, res, next) {
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

    const insertResult = await invModel.insertInventoryItem({
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

    if (insertResult) {
        req.flash(
            "notice",
            `The vehicle ${inv_make} ${inv_model} was created succesfully`
        );
        // We do a 303 redirect because it is so much
        // easier to redirect than to have to generate the necesary
        // parts of the view. I think this should always be done actually
        res.redirect(303, `/inv/type/${classification_id}`);
    } else {
        let nav = await utilities.getNav();
        const classificationSelect = await utilities.buildClassificationSelect(
            classification_id
        );

        req.flash("error", "Sorry, the creation of the vehicle failed.");
        res.status(501).render("./inventory/add-inventory", {
            title: "Add Vehicle to Inventory",
            nav,
            classificationSelect,
        });
    }
};

// This builds the edit vehicle page
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.builEditVehiclePage = async function (req, res, next) {
    const nav = await utilities.getNav();

    const inventory_id = parseInt(req.params.inventoryId);
    const itemData = await invModel.getInventoryItemById(inventory_id);

    const classificationSelect = await utilities.buildClassificationSelect(
        itemData.classification_id
    );

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/edit-inventory", {
        title: `Edit ${itemName}`,
        nav,
        classificationSelect,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_description: itemData.inv_description,
        inv_image: itemData.inv_image,
        inv_thumbnail: itemData.inv_thumbnail,
        inv_price: itemData.inv_price,
        inv_miles: itemData.inv_miles,
        inv_color: itemData.inv_color,
        classification_id: itemData.classification_id,
    });
};

// Update a vehicle (receiving post request)
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.updateVehicle = async function (req, res, next) {
    const {
        inv_id,
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

    const updateResult = await invModel.updateInventory({
        inv_id,
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

    if (updateResult) {
        req.flash(
            "notice",
            `The vehicle ${updateResult.inv_make} ${updateResult.inv_model} was updated succesfully`
        );
        res.redirect("/inv/");
    } else {
        let nav = await utilities.getNav();
        const classificationSelect = await utilities.buildClassificationSelect(
            classification_id
        );
        const itemName = `${inv_make} ${inv_model}`;
        req.flash("error", `Sorry, the update of ${itemName} failed.`);

        res.status(501).render("./inventory/edit-inventory", {
            title: `Edit ${itemName}`,
            nav,
            classificationSelect,
            inv_id,
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
    }
};

// This builds the vehicle deletion confirmation page
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.buildDeleteVehiclePage = async function (req, res, next) {
    const nav = await utilities.getNav();

    const inventory_id = parseInt(req.params.inventoryId);
    const itemData = await invModel.getInventoryItemById(inventory_id);

    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("./inventory/delete-confirm", {
        title: `Delete ${itemName}`,
        nav,
        inv_id: itemData.inv_id,
        inv_make: itemData.inv_make,
        inv_model: itemData.inv_model,
        inv_year: itemData.inv_year,
        inv_price: itemData.inv_price,
    });
};

// Delete a vehicle (receiving post request)
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.deleteVehicle = async function (req, res, next) {
    const inv_id = parseInt(req.body.inv_id);

    const deleteResult = await invModel.deleteInventory(inv_id);

    if (deleteResult) {
        req.flash(
            "notice",
            `The vehicle ${deleteResult.inv_make} ${deleteResult.inv_model} was succesfully deleted`
        );
        res.redirect("/inv/");
    } else {
        const itemName = `${inv_make} ${inv_model}`;
        req.flash("error", `Sorry, the deletion of ${itemName} failed.`);

        res.redirect(`/inv/delete/${inv_id}`);
    }
};

//        d8888  8888888b.   8888888
//       d88888  888   Y88b    888
//      d88P888  888    888    888
//     d88P 888  888   d88P    888
//    d88P  888  8888888P"     888
//   d88P   888  888           888
//  d8888888888  888           888
// d88P     888  888         8888888

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(
        classification_id
    );

    if (invData[0].inv_id) {
        return res.json(invData);
    } else {
        next(new Error("No data returned"));
    }
};

module.exports = invCont;
