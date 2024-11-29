const express = require("express");
const utilities = require("../utilities/index");
const accountValidation = require("../utilities/account-validation");

/**
 * @type {express.Router}
 */
const router = new express.Router();
const accountController = require("../controllers/accountController");

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post(
    "/login",
    accountValidation.loginRules(),
    accountValidation.checkLoginData,
    (req, res) => {
        res.status(200).send("login process");
    }
);

router.get(
    "/registration",
    utilities.handleErrors(accountController.buildRegistration)
);

// Account Registration route
router.post(
    "/registration",
    accountValidation.registrationRules(),
    accountValidation.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;
