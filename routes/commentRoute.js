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

router.post(
    "/delete-comment",
    commentValidation.deleteCommentRules(),
    commentValidation.checkDeleteCommentData,
    utilities.handleErrors(commentController.deleteComment)
);

router.post(
    "/edit-comment",
    commentValidation.editCommentRules(),
    commentValidation.checkEditCommentData,
    utilities.handleErrors(commentController.editComment)
);

module.exports = router;
