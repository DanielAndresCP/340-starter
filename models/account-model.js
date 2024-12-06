const pool = require("../database/index");

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
) {
    try {
        const sql = `
        INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type)
        VALUES ($1, $2, $3, $4, 'Client')
        RETURNING *;
        `;
        return await pool.query(sql, [
            account_firstname,
            account_lastname,
            account_email,
            account_password,
        ]);
    } catch (error) {
        return error.message;
    }
}

async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1";
        const email = await pool.query(sql, [account_email]);
        return email.rowCount !== 0;
    } catch (error) {
        return error.message;
    }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
    try {
        const sql =
            "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1";
        const email = await pool.query(sql, [account_email]);
        return email.rows[0];
    } catch (error) {
        return new Error("Not matching email found");
    }
}

/* *****************************
 * Return account data using account id
 * ***************************** */
async function getAccountById(account_id) {
    try {
        const sql =
            "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1";
        const account = await pool.query(sql, [account_id]);
        return account.rows[0];
    } catch (error) {
        return new Error("Not matching id found");
    }
}

/* *****************************
 * Update account data
 * ***************************** */
async function updateAccount({
    account_firstname,
    account_lastname,
    account_email,
    account_id,
}) {
    try {
        const sql = `
        UPDATE public.account
	        SET account_firstname = $1, 
	        account_lastname = $2,
	        account_email = $3
	        WHERE account_id = $4
	        RETURNING *;
        `;
        const account = await pool.query(sql, [
            account_firstname,
            account_lastname,
            account_email,
            account_id,
        ]);
        return account.rows[0];
    } catch (error) {
        return new Error("There was an error while updating the account");
    }
}

/* *****************************
 * Update account password
 * ***************************** */
async function updateAccountPassword({ account_password, account_id }) {
    try {        
        const sql = `
        UPDATE public.account
	        SET account_password = $1
	        WHERE account_id = $2
	        RETURNING *;
        `;
        const account = await pool.query(sql, [account_password, account_id]);
        return account.rows[0];
    } catch (error) {
        return new Error("There was an error while updating the account");
    }
}

module.exports = {
    registerAccount,
    checkExistingEmail,
    getAccountByEmail,
    getAccountById,
    updateAccount,
    updateAccountPassword,
};
