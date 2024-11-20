const pool = require("../database/index");

/* ***************************
 *  Get all classification data
 * ************************** */
/**
 *
 * @returns {Promise<import("pg").QueryResult<any>>}
 */
async function getClassifications() {
    return await pool.query(
        "SELECT * FROM public.classification ORDER BY classification_name"
    );
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `
            SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
                ON i.classification_id = c.classification_id
            WHERE  i.classification_id = $1
            `,
            [classification_id]
        );

        return data.rows;
    } catch (error) {
        console.error("getclassificationsbyid error", error);
    }
}

async function getInventoryItemById(inv_id) {
    try {
        const data = await pool.query(
            `
            SELECT i.*, c.classification_name
            FROM public.inventory AS i
            JOIN public.classification AS c
                ON i.classification_id = c.classification_id
            WHERE i.inv_id = $1
            `,
            [inv_id]
        );

        // Since we are always looking for 1 item, it makes sense to return the object directly
        return data.rows[0];
    } catch (error) {
        console.error("getInventoryItemById error", error);
    }
}

module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getInventoryItemById,
};
