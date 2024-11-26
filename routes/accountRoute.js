const express = require("express");
const utilities = require("../utilities/index");
const regValidate = require("../utilities/account-validation");

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

// Account Registration route
router.post(
    "/registration",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;
