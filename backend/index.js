// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const AuthRouter = require('./routes/AuthRouter');
const bodyParser = require("body-parser");// To read the req.body given to server having user info 


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// --- DB ---
mongoose
  .connect(process.env.MONGO_URI, {
    // optional: use your preferred options
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// --- Middleware ---

app.use(express.json());

// --- Routes ---
const chatRoutes = require("./routes/chatRoutes");
app.use("/api/chats", chatRoutes);

app.use('/auth', AuthRouter);

// --- Health & Test ---
app.get("/", (req, res) => {
  res.send("API running");
});

app.post("/test", (req, res) => {
  console.log("Test route hit");
  res.json({ ok: true, msg: "✅ Test route working" });
});

// app.post("/order", async(req,res) => {
//   try {
//     const razorpay = require("razorpay");
//     const instance = new razorpay({
//       key_id: process.env.RAZORPAY_KEY_ID,
//       key_secret: process.env.RAZORPAY_KEY_SECRET,
//     });
    
//     const options = req.body;
//     const order = await instance.orders.create(options);  // Use 'instance' instead of 'razorpay'
    
//     if(!order) return res.status(500).send("Some error occured");
//     res.json(order);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error);
//   }  
// });


// ...existing code...
app.post("/order", async (req, res) => {
  try {
    console.log("[/order] request body:", req.body);
    const razorpay = require("razorpay");
    const instance = new razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Validate amount
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      console.warn("[/order] invalid amount received:", req.body.amount);
      return res.status(400).json({ error: "invalid_amount", details: "Amount must be a positive integer (in paise)" });
    }

    const options = {
      amount: Math.round(amount), // ensure integer paise
      currency: req.body.currency || "INR",
      receipt: req.body.receipt || `receipt_${Date.now()}`,
      payment_capture: req.body.payment_capture !== undefined ? req.body.payment_capture : 1
    };

    console.log("[/order] creating order with options:", options);

    const order = await instance.orders.create(options);
    if (!order) return res.status(500).send("Some error occured");
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});


// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
