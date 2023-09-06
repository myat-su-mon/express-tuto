const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const router = express.Router();

// normal route | specific route
router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

// dynamic segment
router.get("/products/:productId", shopController.getProduct);

router.get("/cart", shopController.getCart);

router.post("/cart", shopController.postCart);

router.post("/cart-delete-product", shopController.postCartDeleteProduct);

router.get("/orders", shopController.getOrders);

router.post("/create-order", shopController.postOrder);

router.get("/checkout", shopController.getCheckout);

module.exports = router;
