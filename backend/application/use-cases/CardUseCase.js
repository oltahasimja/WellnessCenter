
class CardUseCase {
  constructor(port) {
    this.port = port;
  }
  async getAll() {
    return await this.port.getAll();
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
module.exports = CardUseCase;
