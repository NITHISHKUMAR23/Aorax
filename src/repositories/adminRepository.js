const db = require("../config/db");

const findAdminByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const query = "SELECT * FROM admin_users WHERE email = ?";
        db.query(query, [email], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

module.exports = {
    findAdminByEmail
};