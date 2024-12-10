const utilities = require("../utilities/index.js");
const commentController = {};
const commentModel = require("../models/comment-model.js");

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
commentController.addComment = async function (req, res) {
    const { comment_text, account_id, inv_id } = req.body;

    // Maybe this should be done client-side but eh
    let dateObj = new Date();
    const offset = dateObj.getTimezoneOffset();
    dateObj = new Date(dateObj.getTime() - offset * 60 * 1000);
    const comment_date = dateObj.toISOString().split("T")[0];

    const result = commentModel.insertComment({
        account_id: parseInt(account_id),
        comment_date,
        comment_text,
        inv_id: parseInt(inv_id),
    });

    if (result) {
        req.flash("notice", "Comment added succesfully");
    } else {
        req.flash("error", "There was an error adding the comment.");
        // We do this to make the form sticky without
        // having to do the whole res.srender thing
        res.locals = { ...res.locals, comment_text };
    }

    res.redirect(`/inv/detail/${inv_id}`);
};

module.exports = commentController;
