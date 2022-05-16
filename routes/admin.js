const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const isAdmin = require("../middleware/admin");
const { body } = require("express-validator");

router.get("/add-product", isAdmin, adminController.getAddProduct);
router.post(
  "/add-product",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Enter Valid title")
      .trim(),
    body("price")
      .isNumeric()
      .isLength({ min: 1 })
      .withMessage("Enter Valid price")
      .trim(),
    body("description")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Enter Valid description")
      .trim(),
  ],
  isAdmin,
  adminController.postAddProduct
);
router.get("/products", isAdmin, adminController.getAdminProducts);
router.get("/edit-product/:productId", isAdmin, adminController.getEditProduct);
router.post(
  "/edit-product",
  [
    body("title")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Enter Valid title")
      .trim(),
    body("price")
      .isNumeric()
      .isLength({ min: 1 })
      .withMessage("Enter Valid price")
      .trim(),
    body("description")
      .isString()
      .isLength({ min: 8 })
      .withMessage("Enter Valid description")
      .trim(),
  ],
  isAdmin,
  adminController.postEditProduct
);
router.delete("/product/:productId", isAdmin, adminController.deleteProduct);

module.exports = router;
