
const CartItem = require("../database/models/CartItem");
const Product = require("../database/models/Product");
const ProductMongo = require("../database/models/ProductMongo");
const Cart = require("../database/models/Cart");
const CartMongo = require("../database/models/CartMongo");
class CartItemRepository {
  async findAll() {
    return CartItem.findAll({ include: [{ model: Product }, { model: Cart }] });
  }
  async findById(id) {
    return CartItem.findByPk(id, { include: [{ model: Product }, { model: Cart }] });
  }
  async create(data) {
    return CartItem.create(data);
  }
  async update(id, data) {
    const resource = await CartItem.findByPk(id);
    if (!resource) return null;
    return resource.update(data);
  }
  async delete(id) {
    const resource = await CartItem.findByPk(id);
    if (!resource) return null;
    return resource.destroy();
  }
}
module.exports = new CartItemRepository();
