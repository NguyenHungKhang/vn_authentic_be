const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// -- Schema Cart --
const CartSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      color: String,
      size: String,
      image: String,
    },
  ],
});
const Cart = mongoose.model("Cart", CartSchema);

// Middleware giả lập xác thực (thay bằng thực tế của bạn)
function authenticateUser(req, res, next) {
  // Ví dụ: lấy token từ header rồi decode ra email
  // Đây là giả lập, bạn thay bằng code thật
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }
  // Giả sử token là email luôn cho dễ demo
  req.user = { email: req.headers.authorization };
  next();
}

// -- Router API giỏ hàng --
router.use(authenticateUser);

// Lấy giỏ hàng
router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ email: req.user.email });
    res.json(cart ? cart.items : []);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Thêm / cập nhật sản phẩm
router.post("/item", async (req, res) => {
  try {
    const item = req.body;
    if (!item.productId || !item.quantity || item.quantity < 1) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ" });
    }

    let cart = await Cart.findOne({ email: req.user.email });
    if (!cart) {
      cart = new Cart({ email: req.user.email, items: [] });
    }

    const index = cart.items.findIndex(i => i.productId === item.productId);
    if (index >= 0) {
      cart.items[index].quantity = item.quantity;
    } else {
      cart.items.push(item);
    }

    await cart.save();
    res.json(cart.items);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa sản phẩm khỏi giỏ
router.delete("/item/:productId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ email: req.user.email });
    if (!cart) return res.status(404).json({ message: "Giỏ hàng trống" });

    cart.items = cart.items.filter(i => i.productId !== req.params.productId);
    await cart.save();
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Xóa toàn bộ giỏ hàng
router.delete("/", async (req, res) => {
  try {
    await Cart.findOneAndDelete({ email: req.user.email });
    res.json({ message: "Xóa giỏ hàng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
