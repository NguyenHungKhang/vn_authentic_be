const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();


const Order = mongoose.model("Order");

// Middleware đơn giản để kiểm tra tài khoản admin (hardcoded)
const isAdmin = (req, res, next) => {
  const auth = req.headers.authorization || "";
  const [username, password] = auth.split(":");
  if (username === "svauth" && password === "admin") {
    return next();
  }
  return res.status(401).json({ message: "Không có quyền truy cập" });
};

// Lấy tất cả đơn hàng
router.get("/orders", isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ Lỗi lấy đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Cập nhật trạng thái đơn hàng
router.put("/orders/:id/status", isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.status = status;
    await order.save();

    res.json({ message: "Cập nhật trạng thái thành công" });
  } catch (error) {
    console.error("❌ Lỗi cập nhật trạng thái:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
