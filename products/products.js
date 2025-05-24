const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Định nghĩa schema và model Product
const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  category: String,
  brand: String,
  model: String,
  price: String,
  description: String,
  image: String,
  images: [String],
  colors: [String],
  sizes: [Number],
});

const Product = mongoose.model('Product', productSchema, 'products');

// API lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// API lấy sản phẩm theo id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: Number(req.params.id) });
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
