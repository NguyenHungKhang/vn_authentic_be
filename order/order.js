const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Schema đơn hàng
const OrderSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    fullName: String,
    phone: String,
    address: String,
    note: String,
    paymentMethod: String,
    items: [
        {
            productId: String,
            name: String,
            price: Number,
            quantity: Number,
            color: String,
            size: String,
            image: String,
            _id: false, // tắt auto _id cho item
        },
    ],
    total: Number,
    status: { type: String, default: "pending" }, // 'pending', 'shipped', 'delivered', 'cancelled'
    date: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

// Middleware giả lập xác thực
function authenticateUser(req, res, next) {
    const email = req.headers.authorization;
    if (!email) {
        return res.status(401).json({ message: "Chưa đăng nhập" });
    }
    req.user = { email };
    next();
}

router.use(authenticateUser);

//
// === API ROUTES ===
//

// 1. Tạo đơn hàng mới
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      fullName,
      phone,
      address,
      note,
      paymentMethod,
      items,
      total,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Giỏ hàng rỗng" });
    }

    const order = new Order({
      userEmail: req.user.email,
      fullName,
      phone,
      address,
      note,
      paymentMethod,
      items,
      total,
    });

    await order.save({ session });

    await Cart.updateOne(
      { email: req.user.email },
      { $set: { items: [] } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: "Đặt hàng thành công", orderId: order._id });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Lỗi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// 2. Lấy lịch sử đơn hàng
router.get("/history", async (req, res) => {
    try {
        const orders = await Order.find({ userEmail: req.user.email }).sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 3. Hủy đơn hàng
router.put("/:orderId/cancel", async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, userEmail: req.user.email });
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        // Không được hủy nếu đơn đã giao
        if (order.status === "delivered") {
            return res.status(400).json({ message: "Đơn hàng đã giao, không thể hủy" });
        }

        order.status = "cancelled";
        await order.save();

        res.json({ message: "Đã hủy đơn hàng thành công" });
    } catch (error) {
        console.error("❌ Lỗi hủy đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 4. Cập nhật thông tin khách hàng trong đơn hàng
router.put("/:orderId/customer", async (req, res) => {
    try {
        const { orderId } = req.params;
        const { fullName, phone, address } = req.body;

        const order = await Order.findOne({ _id: orderId, userEmail: req.user.email });
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        // Không cho phép sửa nếu đơn hàng đã giao hoặc hủy
        if (order.status === "delivered" || order.status === "cancelled") {
            return res.status(400).json({ message: "Không thể sửa thông tin đơn hàng này" });
        }

        order.fullName = fullName;
        order.phone = phone;
        order.address = address;
        await order.save();

        res.json({ message: "Cập nhật thông tin khách hàng thành công" });
    } catch (error) {
        console.error("❌ Lỗi cập nhật thông tin:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 5. Cập nhật số lượng sản phẩm trong đơn hàng
router.put("/:orderId/item/:itemId", async (req, res) => {
    try {
        const { orderId, itemId } = req.params;
        const { quantity } = req.body;

        const order = await Order.findOne({ _id: orderId, userEmail: req.user.email });
        if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        if (order.status === "delivered" || order.status === "cancelled") {
            return res.status(400).json({ message: "Không thể cập nhật sản phẩm trong đơn hàng đã xử lý" });
        }

        const item = order.items.find((i) => i.productId === itemId);
        if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm trong đơn hàng" });

        item.quantity = quantity;

        // Tính lại tổng tiền
        order.total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

        await order.save();
        res.json({ message: "Cập nhật số lượng thành công" });
    } catch (error) {
        console.error("❌ Lỗi cập nhật sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

module.exports = router;
