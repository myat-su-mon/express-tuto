const fs = require("fs");
const path = require("path");

const p = path.join(path.dirname(require.main.filename), "data", "carts.json");

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // fetch previous cart
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      // analyze cart => find existing product
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      // add new product | increase qty
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice += Number(productPrice);

      fs.writeFile(p, JSON.stringify(cart), (err) => console.log(err));
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        return;
      } else {
        const updatedCart = { ...JSON.parse(fileContent) };
        const product = updatedCart.products.find((prod) => prod.id === id);
        const productQty = product.qty;
        updatedCart.products = updatedCart.products.filter(
          (prod) => prod.id !== id
        );
        updatedCart.totalPrice =
          Number(updatedCart.totalPrice) -
          Number(productPrice) * Number(productQty);
        fs.writeFile(p, JSON.stringify(updatedCart), (err) => console.log(err));
      }
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }
};
