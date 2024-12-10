const express = require("express");
/**
 * @type {express.Router}
 */
const router = express.Router();
const utilities = require("../utilities/index");
const commentValidation = require("../utilities/comment-validation");
const commentController = require("../controllers/commentController");

router.post(
    "/add-comment",
    commentValidation.addCommentRules(),
    commentValidation.checkAddCommentData,
    utilities.handleErrors(commentController.addComment)
);

module.exports = router;
