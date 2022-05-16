const express=require('express');
const router=express.Router();
const shopController=require('../controllers/shop');
const isAuth = require("../middleware/auth");

router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get('/product-detail/:productId',shopController.getProductDetail);
router.get('/cart',isAuth,shopController.getCart);
router.post("/cart", isAuth,shopController.postCart);
router.post('/cart-delete-item',isAuth,shopController.postDeleteCartItem)
router.get("/orders", isAuth,shopController.getOrders);
router.get('/checkout/success',isAuth,shopController.postOrders);
router.get('/checkout',isAuth,shopController.getCheckout);
router.get('/checkout/cancel',isAuth,shopController.getCheckout)
router.get('/orders/:orderId',isAuth,shopController.getInvoice);

module.exports=router;