const pool = require("../database/index");

async function getComments() {
    try {
        return await pool.query(
            `
            SELECT
                comment_id,
                comment_text,
                comment_date,
                inv_id,
                c.account_id,
                account_firstname,
                account_lastname
            FROM public.comment AS c
                JOIN account AS a ON a.account_id = c.account_id
            ORDER BY comment_date DESC;
            `
        ).rows;
    } catch (error) {
        console.error("getComments error", error);
    }
}

async function getCommentbyId(comment_id) {
    try {
        const data = await pool.query(
            `
            SELECT
                comment_id,
                comment_text,
                comment_date,
                inv_id,
                c.account_id,
                account_firstname,
                account_lastname
            FROM public.comment AS c
                JOIN account AS a ON a.account_id = c.account_id
            WHERE comment_id = $1
            ORDER BY comment_date DESC ;
            `,
            [comment_id]
        );

        return data.rows;
    } catch (error) {
        console.error("getCommentById error", error);
    }
}

async function insertComment({
    comment_text,
    comment_date,
    account_id,
    inv_id,
}) {
    try {
        const sql = `
        INSERT INTO public.comment (comment_text, comment_date, account_id, inv_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
        `;
        return await pool.query(sql, [
            comment_text,
            comment_date,
            account_id,
            inv_id,
        ]);
    } catch (error) {
        console.error("insertComment error", error);
    }
}

async function updateComment({ comment_text, comment_date, comment_id }) {
    try {
        const sql = `
        UPDATE public.comment
        SET comment_text = $1,
        comment_date = $2
        WHERE comment_id = $3
        RETURNING *;
        `;
        const data = await pool.query(sql, [
            comment_text,
            comment_date,
            comment_id,
        ]);

        return data.rows[0];
    } catch (error) {
        console.error("updateComment error:", error);
    }
}

async function deleteComment(comment_id) {
    try {
        const sql = `DELETE FROM comment WHERE comment_id = $1;`;
        const data = await pool.query(sql, [comment_id]);

        return data;
    } catch (error) {
        console.error("Delete inventory error:", error);
    }
}

module.exports = { getComments, getCommentbyId, insertComment, deleteComment };
