class AppointmentUseCase {
  constructor(port) {
    this.port = port;
  }
  async getAll(filter = {}) {  // Shto parametrin filter
    return await this.port.getAll(filter);
  }
  async getById(id) {
    return await this.port.getById(id);
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
}
module.exports = AppointmentUseCase;