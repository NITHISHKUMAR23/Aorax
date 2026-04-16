class IAuthService {
    async loginUser(credentials) {
        throw new Error('Method loginUser() must be implemented');
    }

    async registerUser(userData) {
        throw new Error('Method registerUser() must be implemented');
    }

    async getUserProfile(userId) {
        throw new Error('Method getUserProfile() must be implemented');
    }

    async updateUserProfile(userId, userData) {
        throw new Error('Method updateUserProfile() must be implemented');
    }

    async changePassword(userId, oldPassword, newPassword) {
        throw new Error('Method changePassword() must be implemented');
    }

    async verifyToken(token) {
        throw new Error('Method verifyToken() must be implemented');
    }

    async refreshToken(refreshToken) {
        throw new Error('Method refreshToken() must be implemented');
    }
}

module.exports = IAuthService;
