// controllers/orderController.js
const Order = require("../models/Order");
const cloudinary = require("../config/cloudinary");
const { sendMail } = require("../config/mailer");

exports.create = async (req, res) => {
  try {
    console.log("===== NEW ORDER REQUEST =====");
    console.log("Raw req.body:", req.body);
    console.log("Raw req.file:", req.file);

    console.log("ENV → FROM_EMAIL:", process.env.FROM_EMAIL);
    console.log("ENV → ADMIN_EMAIL:", process.env.ADMIN_EMAIL);
    console.log("Mailer exists:", sendMail ? "YES" : "NO");

    let { cartItems, shippingInfo } = req.body;

    console.log("Before parse → cartItems:", cartItems);
    console.log("Before parse → shippingInfo:", shippingInfo);

    if (typeof cartItems === "string") {
      try {
        cartItems = JSON.parse(cartItems);
        console.log("Parsed cartItems:", cartItems);
      } catch (e) {
        console.error("❌ cartItems JSON parse error:", e);
      }
    }

    if (typeof shippingInfo === "string") {
      try {
        shippingInfo = JSON.parse(shippingInfo);
        console.log("Parsed shippingInfo:", shippingInfo);
      } catch (e) {
        console.error("❌ shippingInfo JSON parse error:", e);
      }
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      console.log("❌ Cart empty or invalid:", cartItems);
      return res.status(400).json({ error: "Cart empty" });
    }

    const subtotal = cartItems.reduce((s, it) => s + it.price * it.quantity, 0);
    const shipping = 0;
    const total = subtotal + shipping;

    const orderNumber = `LV-${Date.now()}`;

    console.log("Calculated subtotal:", subtotal);
    console.log("Calculated shipping:", shipping);
    console.log("Calculated total:", total);
    console.log("Generated order number:", orderNumber);

    // Upload screenshot to Cloudinary (optional)
    let screenshotUrl = null;
    if (req.file) {
      console.log("Uploading screenshot to Cloudinary...");
      try {
        const uploaded = await cloudinary.uploader.upload(req.file.path, {
          folder: "lavish_orders",
        });
        screenshotUrl = uploaded.secure_url;
        console.log("Screenshot URL:", screenshotUrl);
      } catch (e) {
        console.error("❌ Cloudinary upload failed:", e);
      }
    } else {
      console.log("No screenshot uploaded");
    }

    // Build email HTML
    console.log("Building email HTML...");
    console.log("shippingInfo used inside HTML:", shippingInfo);

    const shippingHtml = `
      <h3>Shipping Info</h3>
      <ul>
        <li><strong>Name:</strong> ${shippingInfo?.firstName || ""} ${shippingInfo?.lastName || ""}</li>
        <li><strong>Email:</strong> ${shippingInfo?.email}</li>
        <li><strong>Phone:</strong> ${shippingInfo?.phone}</li>
        <li><strong>Address:</strong> ${shippingInfo?.address}</li>
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

    console.log("Email HTML built successfully.");

    // Send email BEFORE database save
    console.log("===== SENDING EMAIL VIA RESEND =====");
    let emailResponse;

    try {
      console.log("Calling sendMail() with:", {
        to: process.env.ADMIN_EMAIL,
        subject: `New Order: ${orderNumber}`
      });

      emailResponse = await sendMail({
        to: process.env.ADMIN_EMAIL,
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

      console.log("FULL emailResponse from Resend:", emailResponse);
      console.log("Email sent → ID:", emailResponse?.id || emailResponse?.data?.id);

    } catch (emailErr) {
      console.warn("❌ EMAIL FAILED →", emailErr.message);
      console.warn("Full error object:", emailErr);
      return res.status(500).json({
        error: "Failed to send email. Order not saved.",
      });
    }

    // Save order only if email worked
    console.log("Saving order to database...");
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

    console.log("Order saved successfully with ID:", order._id);

    return res.status(201).json(order);
  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    return res.status(500).json({ error: "server error" });
  }
};
