const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list (I actually use a elements, so I will modify the code from the course)
 ************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
Util.getNav = async function (req, res, next) {
    const data = await invModel.getClassifications();
    const html = data.rows.map((row) => {
        return `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`;
    });
    return html.join("");
};

/* **************************************
 * Build the classification view HTML (Modified code from the course to make it pretty)
 * ************************************ */
/**
 *
 * @param {[]} data
 */
Util.buildClassificationGrid = function (data) {
    // If there are no vehicles, we return inmediately
    if (data.length === 0) {
        return '<p class="notice>Sorry, no matching vehicles could be found.</p>';
    }

    const vehicleCards = [];

    for (const vehicle of data) {
        // prettier-ignore
        const html = `
        <a
            href="../../inv/detail/${vehicle.inv_id}"
            title="View ${vehicle.inv_make} ${vehicle.inv_model} details"
        >
            <article>
                <img
                    src="${vehicle.inv_thumbnail}"
                    alt="Photograph of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors"
                />
                <hr />
                <div class="namePrice">
                    <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
                    <span>
                        ${new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0
                        }).format(vehicle.inv_price)}
                    </span>
                </div>
            </article>
        </a>
        `;

        vehicleCards.push(html);
    }

    return `<div id=inv-display> ${vehicleCards.join("")} </div>`;
};

Util.buildInventoryDetails = function (data) {
    const vehicleMakeAndModel = `${data.inv_make} ${data.inv_model}`;
    const formattedPrice = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(Number(data.inv_price));
    const formattedMiles = new Intl.NumberFormat("en-US").format(
        Number(data.inv_miles)
    );

    const html = `
    <section class="vehicle-details-container">
        <div class="vehicle-img">
            <img src="${data.inv_image}" alt="Photograph of ${vehicleMakeAndModel}">
        </div>
        <div class="vehicle-details">
            <h2>${vehicleMakeAndModel} Details</h2>
            <div>
                <p><b>Price: ${formattedPrice}</b></p>
                <p><b>Description:</b> ${data.inv_description}</p>
                <p><b>Exterior Color:</b> ${data.inv_color}</p>
                <p><b>Mileage:</b> ${formattedMiles}</p>
                <p><b>Year:</b> ${data.inv_year}</p>
                <p><b>Classification:</b> ${data.classification_name}</p>
            </div>
        </div>
    </section>
    `;

    // return `${html} <pre>${JSON.stringify(data, null, 4)}</pre>`;
    return html;
};

// This builds a select with all the classifications as options
Util.buildClassificationSelect = async function (classification_id = null) {
    const data = await invModel.getClassifications();

    const options = [`<option value="">Choose a Classification</option>`];

    for (const row of data.rows) {
        const isSelected =
            classification_id !== null &&
            row.classification_id == classification_id;

        options.push(
            `<option value="${row.classification_id}" 
                ${isSelected ? "selected" : ""}
            >
                ${row.classification_name}
            </option>`
        );
    }

    return `
    <select name="classification_id" required>
        ${options.join("")}
    </select>
    `;
};

/* ****************************************
 * Middleware to check token validity
 **************************************** */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    req.flash("error", "Please log in");
                    res.clearCookie("jwt");
                    return res.redirect("/account/login");
                }
                res.locals.accountData = accountData;
                res.locals.loggedin = 1;
                next();
            }
        );
    } else {
        next();
    }
};

/* ****************************************
 *  Check Login
 * ************************************ */
/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next();
    } else {
        req.flash("notice", "Please log in.");
        return res.redirect("/account/login");
    }
};

/**
 * Generates the authorization check middleware
 * @param {string} requiredAuthLevel The required authorization level (Client, Employee, Admin)
 * @returns {Function} The middleware function with the correct authorization check
 */
Util.checkAuthorization = function (requiredAuthLevel) {
    return (req, res, next) => {
        // If they are not logged in, we tell them to log in
        if (!res.locals.loggedin) {
            req.flash("notice", "Please log in.");
            return res.redirect(302, "/account/login");
        }

        // If they are not authorized, we tell them that they are not authorized
        // And send them to the login view in case they have access on another account
        if (
            !Util.isAuthorized(
                res.locals.accountData.account_type,
                requiredAuthLevel
            )
        ) {
            req.flash(
                "notice",
                "You are not authorized to this part of the application."
            );
            return res.redirect(302, "/account/login");
        }

        // If all is good, we continue normally
        next();
    };
};

/**
 *  Compares an account level against a required level to see if the user ius authorized
 * @param {string} level The level to compare
 * @param {string} requiredLevel The required level to be authorized
 * @returns {boolean} True if they authorized
 */
Util.isAuthorized = function (level, requiredLevel) {
    const levels = ["Client", "Employee", "Admin"];

    const levelIndex = levels.indexOf(level);
    const requiredLevelIndex = levels.indexOf(requiredLevel);

    // If the level does not exist
    if (levelIndex === -1) {
        return false;
    }

    // If the level is not high enough
    if (levelIndex < requiredLevelIndex) {
        return false;
    }

    return true;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

Util.createCommentHTML = function ({
    commentAuthor,
    commentText,
    commentDate,
    commentId,
    showActions,
}) {
    return `
    <article class="comment">
        <div>
            <div>
                <p class="comment-author">(${commentDate}) ${commentAuthor} says:</p>
                <p class="comment-text">${commentText}</p>
            </div>
            ${
                showActions
                    ? `<div data-comment-id="${commentId}">
                        <button class="edit-comment-button">Edit</button>
                        <button class="delete-comment-button">Delete</button>
                    </div>`
                    : ""
            }
        </div>
    </article>`;
};

Util.createCommentList = function (commentList) {
    return `
    <section class="comments-container">
        <h2>Comments</h2>
        ${
            commentList.length
                ? commentList.map((x) => Util.createCommentHTML(x)).join("")
                : "No comments found :("
        }
    </section>
    `;
};

module.exports = Util;
