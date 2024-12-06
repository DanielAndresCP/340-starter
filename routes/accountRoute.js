const express = require("express");
const utilities = require("../utilities/index");
const accountValidation = require("../utilities/account-validation");

/**
 * @type {express.Router}
 */
const router = new express.Router();
const accountController = require("../controllers/accountController");

router.get(
    "/",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountPage)
);

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post(
    "/login",
    accountValidation.loginRules(),
    accountValidation.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
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

// Account information update page
router.get(
    "/update/:account_id",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountUpdatePage)
);

// Account information update (receive post request)
router.post(
    "/update-account-information",
    accountValidation.updateDataRules(),
    accountValidation.checkUpdateData,
    utilities.handleErrors(accountController.updateAccountData)
);

// Account password update (receive post request)
router.post(
    "/update-account-password",
    accountValidation.updatePasswordRules(),
    accountValidation.checkPasswordData,
    utilities.handleErrors(accountController.updateAccountPassword)
);


router.get("/logout",
    utilities.handleErrors(accountController.logout)
)

module.exports = router;
