const express = require("express");
const utilities = require("../utilities/index");
const inventoryValidation = require("../utilities/inventory-validation");
/**
 * @type {express.Router}
 */
const router = new express.Router();
const invController = require("../controllers/invController");

// 8888888                           8888888b.             888       888  d8b
//   888                             888   Y88b            888       888  Y8P
//   888                             888    888            888       888
//   888    88888b.   888  888       888   d88P  888  888  88888b.   888  888   .d8888b
//   888    888 "88b  888  888       8888888P"   888  888  888 "88b  888  888  d88P"
//   888    888  888  Y88  88P       888         888  888  888  888  888  888  888
//   888    888  888   Y8bd8P        888         Y88b 888  888 d88P  888  888  Y88b.
// 8888888  888  888    Y88P         888          "Y88888  88888P"   888  888   "Y8888P
//
//
//
// Route to build inventory by classification view
router.get(
    "/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build the vehicle detail view
router.get(
    "/detail/:invId",
    utilities.handleErrors(invController.buildInventoryItem)
);

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
router.get("/", utilities.handleErrors(invController.buildInventoryManagement));

router.get(
    "/add-classification",
    utilities.handleErrors(invController.buildAddClassification)
);

router.post(
    "/add-classification",
    inventoryValidation.createClassificationRules(),
    inventoryValidation.checkNewClassificationData,
    utilities.handleErrors(invController.createClassification)
);

router.get(
    "/add-inventory",
    utilities.handleErrors(invController.buildAddVehicle)
);

router.post(
    "/add-inventory",
    inventoryValidation.createVehicleRules(),
    inventoryValidation.checkNewVehicleData,
    utilities.handleErrors(invController.createVehicle)
);

module.exports = router;
