const express = require("express");
const utilities = require("../utilities/index");
/**
 * @type {express.Router}
 */
const router = new express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get(
    "/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build the vehicle detail view
router.get(
    "/detail/:invId",
    utilities.handleErrors(invController.buildInventoryManagement)
);

// Invemtory management view
router.get("/", utilities.handleErrors(invController.buildInventoryManagement));

module.exports = router;
