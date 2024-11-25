const express = require("express");
const utilities = require("../utilities/index");
/**
 * @type {express.Router}
 */
const router = new express.Router();
const accountController = require("../controllers/accountController");

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get(
    "/registration",
    utilities.handleErrors(accountController.buildRegistration)
);

module.exports = router;
