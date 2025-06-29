class UserUseCase {
  constructor(port) {
    this.port = port;
  }

  async getSpecialists() {
    return await this.port.getSpecialists();
  }

  async updatePassword(id, currentPassword, newPassword) {
    return await this.port.updatePassword(id, currentPassword, newPassword);
  }

  async getAll() {
    return await this.port.getAll();
  }

  async getById(id) {
    return await this.port.getById(id);
  }

  async findByRole(roleId) {
    return await this.port.findByRole(roleId);
  }

  async create(data) {
    return await this.port.create(data);
  }

  async update(id, data) {
    return await this.port.update(id, data);
  }

  async delete(id) {
    return await this.port.delete(id);
  }

 
  async getDeleted() {
    return await this.port.getDeleted();
  }

  /**
   * @param {string} id 
   */
  async restore(id) {
    return await this.port.restore(id);
  }
}

module.exports = UserUseCase;