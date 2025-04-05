class AppointmentPort {
  constructor(repository) {
    this.repository = repository;
  }
  async getAll(filter = {}) {  // Shto parametrin filter
    return await this.repository.findAll(filter);
  }
  async getById(id) {
    return await this.repository.findById(id);
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
module.exports = AppointmentPort;