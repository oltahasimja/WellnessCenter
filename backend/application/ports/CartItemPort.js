
class CartItemPort {
  constructor(repository) {
    this.repository = repository;
  }
  async getAll() {
    return await this.repository.findAll();
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
  async updateMongoOnlyByUserId(userId, items) {
  return await this.repository.updateMongoOnlyByUserId(userId, items);
}

  async delete(id) {
    return await this.repository.delete(id);
  }
}
module.exports = CartItemPort;
