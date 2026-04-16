class IAuthRepository {
    async getUserByEmail(email) {
        throw new Error('Method getUserByEmail() must be implemented');
    }

    async getUserById(id) {
        throw new Error('Method getUserById() must be implemented');
    }

    async createUser(userData) {
        throw new Error('Method createUser() must be implemented');
    }

    async updateUser(id, userData) {
        throw new Error('Method updateUser() must be implemented');
    }

    async deleteUser(id) {
        throw new Error('Method deleteUser() must be implemented');
    }

    async getAllUsers(filters) {
        throw new Error('Method getAllUsers() must be implemented');
    }

    async checkEmailExists(email) {
        throw new Error('Method checkEmailExists() must be implemented');
    }
}

module.exports = IAuthRepository;
