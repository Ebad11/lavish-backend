const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { v4: uuidv4 } = require("uuid");
const { sendMail } = require("../config/mailer");

exports.create = async (req, res) => {
  try {
    const { cartId, cartItems, shippingInfo } = req.body;

    let items = cartItems;
    if (!items || items.length === 0) {
      // try to load from cart on server
      const cid = cartId || "default";
      const cart = await Cart.findOne({ cartId: cid });
      items = (cart && cart.items) ? cart.items.map(i => ({
        productId: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        category: i.category,
      })) : [];
    }

    if (!items || items.length === 0) return res.status(400).json({ error: "cart empty" });

    const subtotal = items.reduce((s, it) => s + (it.price * it.quantity), 0);
    const shipping = subtotal > 2000 ? 0 : 150;
    const total = subtotal + shipping;

    const orderNumber = `LV-${Date.now()}`;

    const order = await Order.create({
      orderNumber,
      items,
      shippingInfo,
      subtotal,
      shipping,
      total,
      status: "pending",
    });

    // Optionally: clear the cart
    if (cartId) {
      await Cart.findOneAndUpdate({ cartId }, { items: [] });
    }

    // Send an email to admin about new order (optional)
    try {
      await sendMail({
        subject: `New Order: ${orderNumber}`,
        html: `<p>New order received: <strong>${orderNumber}</strong></p>
               <p>Total: ₹${total}</p>
               <pre>${JSON.stringify({ shippingInfo, items }, null, 2)}</pre>`,
      });
    } catch (err) {
      console.warn("Order email failed:", err.message);
    }

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
};
