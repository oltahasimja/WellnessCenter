
class UserPort {
  constructor(repository) {
    this.repository = repository;
  }
  async getSpecialists() {
    return await this.repository.getSpecialists();
  }
  async updatePassword(id, currentPassword, newPassword) {
  return await this.repository.updatePassword(id, currentPassword, newPassword);
  }

  async getAll() {
    return await this.repository.findAll();
  }
  async getById(id) {
    return await this.repository.findById(id);
  }
  async findByRole(roleId) {
    return await this.repository.findByRole(roleId);
  }
  async create(data) {
    return await this.repository.create(data);
  }
  async update(id, data) {
    return await this.repository.update(id, data);
  }
  async delete(id) {
    return await this.repository.delete(id);
  }


}
module.exports = UserPort;
