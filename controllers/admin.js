const { validationResult } = require("express-validator");
const Product = require("../models/product");
const fileHelper = require("../util/fileHelper");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    title: "Add Product",
    path: "/admin/add-product",
    edit: false,
    hasError: false,
    validationError: [],
    errorMessage: undefined,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  const error = validationResult(req);
  console.log(image);
  if (!image) {
    return res.render("admin/edit-product", {
      title: "Add Product",
      path: "/admin/add-product",
      edit: false,
      hasError: true,
      errorMessage: "File is not an image",
      validationError: error.array(),
      product: {
        title: title,
        description: description,
        price: price,
      },
    });
  }
  const imageUrl = image.path;
  if (!error.isEmpty()) {
    return res.render("admin/edit-product", {
      title: "Add Product",
      path: "/admin/add-product",
      edit: false,
      hasError: true,
      errorMessage: error.array()[0].msg,
      validationError: error.array(),
      product: {
        title: title,
        description: description,
        price: price,
      },
    });
  }
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    description: description,
    price: price,
    userId: req.user,
  });
  product
    .save()
    .then((product) => {
      // console.log(product);
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAdminProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("admin/products", {
        title: "Admin Products",
        products: products,
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const productId = req.params.productId;
  const editMode = req.query.edit;
  Product.findById(productId)
    .then((product) => {
      if (!product) {
        res.redirect("/");
      }
      res.render("admin/edit-product", {
        title: "Edit Product",
        path: "/admin/edit-product",
        edit: editMode,
        product: product,
        errorMessage: undefined,
        hasError: true,
        validationError: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.render("admin/edit-product", {
      title: "Edit Product",
      path: "/admin/edit-product",
      edit: true,
      hasError: true,
      errorMessage: error.array()[0].msg,
      validationError: error.array(),
      product: {
        _id: id,
        title: title,
        description: description,
        price: price,
      },
    });
  }
  Product.findById(id)
    .then((product) => {
      product.title = title;
      if (image) {
        console.log(product.imageUrl);
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.description = description;
      product.price = price;
      return product.save();
    })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if(!product){
        return next(new Error('product not found'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.findByIdAndDelete(prodId);
    })
    .then((result) => {
      res.json({message:'product deleted'});
    })
    .catch((err) => {
      res.status(500).json({message:'failed to delete product'});
    });
};
