const adminRepo = require("../repositories/adminRepository");
const jwt = require("jsonwebtoken");

const loginAdmin = async (email, password) => {
    const admin = await adminRepo.findAdminByEmail(email);

    if (!admin) {
        throw new Error("Admin not found");
    }

    // Plain password check (as per your design)
    if (admin.password !== password) {
        throw new Error("Invalid credentials");
    }

    // Generate JWT Token
    const token = jwt.sign(
        {
            id: admin.id,
            email: admin.email,
            role: "admin"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

    return {
        id: admin.id,
        email: admin.email,
        token
    };
};

module.exports = {
    loginAdmin
};