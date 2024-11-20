const invModel = require("../models/inventory-model");
const Util = {};

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
Util.buildClassificationGrid = async function (data) {
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

module.exports = Util;
