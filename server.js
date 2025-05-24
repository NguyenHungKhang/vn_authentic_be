// server.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const cors = require('cors');
const connectDB = require('./db/connect');

// api
const productRouter = require('./products/products');
const authenticationRouter = require('./authentication/authentication.js');
const cartRouter = require('./cart/cart.js');
const orderRouter = require('./order/order.js');
const adminRouter = require('./admin/admin.js');

app.use(cors());

connectDB();

// Middleware để parse JSON
app.use(express.json());

// API test
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong 🏓' });
});


app.use('/api/products', productRouter);
app.use('/api/authentication', authenticationRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);
app.use('/api/admin', adminRouter);

// Khởi động server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
