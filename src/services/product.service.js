const Product = require("../models/product.model");
const AppError = require("../utils/appError");
const ApiFeatures = require("../utils/apiFeatures");
const { uploadFilesToBlob, deleteFileFromBlob } = require("../utils/blobStorage");

const parseJsonField = (field, defaultValue = []) => {
  if (!field) return defaultValue;
  return typeof field === "string" ? JSON.parse(field) : field;
};

const createProductService = async (payload, files) => {
  const {
    title,
    description,
    price,
    discountPrice,
    category,
    brand,
    gender,
    sizes,
    colors,
    isPublished,
    isFeatured,
  } = payload;

  if (!title || price === undefined) {
    throw new AppError("نام و قیمت محصول الزامی است", 400);
  }

  const images = await uploadFilesToBlob(files);

  const product = await Product.create({
    title,
    description,
    price,
    discountPrice,
    category,
    brand,
    gender,
    sizes: parseJsonField(sizes),
    colors: parseJsonField(colors),
    images,
    isPublished,
    isFeatured,
  });

  return product;
};

const getProductsService = async (queryString) => {
  const baseQuery = Product.find({ isPublished: true });

  const features = new ApiFeatures(baseQuery, queryString)
    .search()
    .filter()
    .sort()
    .paginate();

  const products = await features.query;

  const totalQuery = Product.find({ isPublished: true });
  const totalFeatures = new ApiFeatures(totalQuery, queryString).search().filter();
  const total = await Product.countDocuments(totalFeatures.query.getFilter());

  return {
    products,
    total,
    page: features.page,
    pages: Math.ceil(total / features.limit),
  };
};

const getAdminProductsService = async () => {
  return Product.find().sort("-createdAt");
};

const getProductByIdService = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("محصول یافت نشد", 404);
  }

  return product;
};

const updateProductService = async (productId, payload, files) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("محصول یافت نشد", 404);
  }

  const allowedFields = [
    "title",
    "description",
    "price",
    "discountPrice",
    "category",
    "brand",
    "gender",
    "isPublished",
    "isFeatured",
  ];

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      product[field] = payload[field];
    }
  });

  if (payload.sizes !== undefined) {
    product.sizes = parseJsonField(payload.sizes);
  }

  if (payload.colors !== undefined) {
    product.colors = parseJsonField(payload.colors);
  }

  if (files && files.length > 0) {
    const newImages = await uploadFilesToBlob(files);
    product.images = [...product.images, ...newImages];
  }

  await product.save();
  return product;
};

const deleteProductService = async (productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("محصول یافت نشد", 404);
  }

  await Promise.all(product.images.map((url) => deleteFileFromBlob(url)));

  await product.deleteOne();
};

const deleteProductImageService = async (productId, imageUrl) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new AppError("محصول یافت نشد", 404);
  }

  if (!imageUrl) {
    throw new AppError("آدرس تصویر الزامی است", 400);
  }

  product.images = product.images.filter((img) => img !== imageUrl);

  await deleteFileFromBlob(imageUrl);

  await product.save();

  return product;
};

module.exports = {
  createProductService,
  getProductsService,
  getAdminProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  deleteProductImageService,
};