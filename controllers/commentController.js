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

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
commentController.editComment = async function (req, res) {
    const comment_id = parseInt(req.body.comment_id);
    const inv_id = parseInt(req.body.inv_id);
    const comment_text = req.body.comment_text;

    let dateObj = new Date();
    const offset = dateObj.getTimezoneOffset();
    dateObj = new Date(dateObj.getTime() - offset * 60 * 1000);
    const comment_date = dateObj.toISOString().split("T")[0];

    const commentData = await commentModel.getCommentbyId(comment_id);

    const userIsAdmin = res.locals.accountData.account_type === "Admin";
    const isSameUser =
        res.locals.accountData.account_id == commentData.account_id;

    if (!isSameUser && !userIsAdmin) {
        req.flash("error","You are not authorized for this action")
        return res.redirect(`/inv/detail/${inv_id}`);
    }

    const result = await commentModel.updateComment({
        comment_date,
        comment_id,
        comment_text,
    });
    
    if (result) {
        req.flash("notice","Comment updated successfully")
        return res.redirect(`/inv/detail/${inv_id}`);
    } else {
        req.flash("error", "There was an error updating the comment");
        return res.redirect(`/inv/detail/${inv_id}`);
    }
};

//        d8888            d8b
//       d88888            Y8P
//      d88P888
//     d88P 888  88888b.   888
//    d88P  888  888 "88b  888
//   d88P   888  888  888  888
//  d8888888888  888 d88P  888
// d88P     888  88888P"   888
//               888
//               888
//               888

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
commentController.deleteComment = async function (req, res) {
    const comment_id = parseInt(req.body.comment_id);

    const commentData = await commentModel.getCommentbyId(comment_id);
    const userIsAdmin = res.locals.accountData.account_type === "Admin";
    const isSameUser =
        res.locals.accountData.account_id == commentData.account_id;

    if (!isSameUser && !userIsAdmin) {
        return res.json({
            hasErrors: true,
            errors: ["You are not authorized to delete this comment."],
        });
    }

    const result = await commentModel.deleteComment(comment_id);

    if (result.success) {
        return res.json({ success: true, msg: "Comment deleted succesfully" });
    } else {
        return res.json({
            hasErrors: true,
            errors: ["There was an error deleting the comment."],
        });
    }
};

module.exports = commentController;
