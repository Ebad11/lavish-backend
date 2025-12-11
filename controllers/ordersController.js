// controllers/orderController.js
const Order = require("../models/Order");
const cloudinary = require("../config/cloudinary");
const { sendMail } = require("../config/mailer");

exports.create = async (req, res) => {
  try {
    let { cartItems, shippingInfo } = req.body;

    if (typeof cartItems === "string") cartItems = JSON.parse(cartItems);
    if (typeof shippingInfo === "string") shippingInfo = JSON.parse(shippingInfo);

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart empty" });
    }

    const subtotal = cartItems.reduce(
      (s, it) => s + it.price * it.quantity, 0
    );

    const shipping = subtotal > 2000 ? 0 : 150;
    const total = subtotal + shipping;

    const orderNumber = `LV-${Date.now()}`;

    // Upload screenshot to Cloudinary (optional)
    let screenshotUrl = null;
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "lavish_orders",
      });
      screenshotUrl = uploaded.secure_url;
    }

    // Build email HTML
    const shippingHtml = `
      <h3>Shipping Info</h3>
      <ul>
        <li><strong>Name:</strong> ${shippingInfo.firstName || ""} ${shippingInfo.lastName || ""}</li>
        <li><strong>Email:</strong> ${shippingInfo.email}</li>
        <li><strong>Phone:</strong> ${shippingInfo.phone}</li>
        <li><strong>Address:</strong> ${shippingInfo.address}</li>
      </ul>
    `;

    const cartHtml = `
      <h3>Cart Items</h3>
      <table border="1" cellspacing="0" cellpadding="5">
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Subtotal</th>
        </tr>
        ${cartItems
          .map(
            (it) => `
              <tr>
                <td>${it.name}</td>
                <td>${it.quantity}</td>
                <td>₹${it.price}</td>
                <td>₹${it.price * it.quantity}</td>
              </tr>
            `
          )
          .join("")}
      </table>
    `;

    // Send email BEFORE database save
    let emailResponse;
    try {
      emailResponse = await sendMail({
        subject: `New Order: ${orderNumber}`,
        html: `
          <h2>New Order Received</h2>
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Total:</strong> ₹${total}</p>
          ${shippingHtml}
          ${cartHtml}
          ${screenshotUrl ? `<p><a href="${screenshotUrl}">View Screenshot</a></p>` : ""}
        `,
      });

      console.log("Email sent → ID:", emailResponse?.id);

    } catch (emailErr) {
      console.warn("Email sending failed:", emailErr.message);
      return res.status(500).json({
        error: "Failed to send email. Order not saved.",
      });
    }

    // Save order only if email worked
    const order = await Order.create({
      orderNumber,
      items: cartItems,
      shippingInfo,
      subtotal,
      shipping,
      total,
      status: "pending",
      paymentScreenshot: screenshotUrl,
    });

    return res.status(201).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
};
