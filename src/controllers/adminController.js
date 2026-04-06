const adminService = require("../services/adminService");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Email and password are required"
            });
        }

        const result = await adminService.loginAdmin(email, password);

        res.json({
            status: "success",
            message: "Admin login successful",
            data: result
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
};

module.exports = {
    login
};