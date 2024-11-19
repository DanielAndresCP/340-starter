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
        <article>
            <a
                href="../../inv/detail/${vehicle.inv_id}"
                title="View ${vehicle.inv_make} ${vehicle.inv_model} details"
            >
                <img
                    src="${vehicle.inv_thumbnail}"
                    alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors"
                />
            </a>
            <hr />
            <div class="namePrice">
                <a
                    href="../../inv/detail/${vehicle.inv_id}"
                    title="View ${vehicle.inv_make} ${vehicle.inv_model} details"
                >
                    <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
                </a>
                <span>
                    ${new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0
                    }).format(vehicle.inv_price)}
                </span>
            </div>
        </article>
        `;

        vehicleCards.push(html);
    }

    return `<section id=inv-display> ${vehicleCards.join("")} </section>`;
};

module.exports = Util;
