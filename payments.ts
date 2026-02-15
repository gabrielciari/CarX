import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

// Create payment preference
app.post("/api/payments/create-preference", async (c) => {
  try {
    const { items, payer } = await c.req.json();
    const accessToken = (c.env as any).MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return c.json({ error: "Mercado Pago não configurado" }, 500);
    }

    const preference = {
      items: items.map((item: any) => ({
        title: item.name,
        quantity: 1,
        unit_price: item.price,
      })),
      payer: {
        name: payer.name,
        email: payer.email,
        phone: {
          number: payer.phone,
        },
      },
      back_urls: {
        success: `${new URL(c.req.url).origin}/payment-success`,
        failure: `${new URL(c.req.url).origin}/payment-failure`,
        pending: `${new URL(c.req.url).origin}/payment-pending`,
      },
      auto_return: "approved",
      notification_url: `${new URL(c.req.url).origin}/api/payments/webhook`,
    };

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preference),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Mercado Pago error:", error);
      return c.json({ error: "Erro ao criar preferência de pagamento" }, 500);
    }

    const data = await response.json() as any;
    return c.json({ init_point: data.init_point, preference_id: data.id });
  } catch (error) {
    console.error("Payment error:", error);
    return c.json({ error: "Erro ao processar pagamento" }, 500);
  }
});

// Create order
app.post("/api/orders", async (c) => {
  try {
    const { userId, userEmail, customer, items, totalAmount, paymentId } =
      await c.req.json();

    const result = await c.env.DB.prepare(
      `INSERT INTO orders (
        user_id, user_email, customer_name, customer_phone, 
        customer_address, customer_number, customer_complement,
        total_amount, payment_status, payment_id, items
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        userId,
        userEmail,
        customer.name,
        customer.phone,
        customer.address,
        customer.number,
        customer.complement || "",
        totalAmount,
        "pending",
        paymentId || "",
        JSON.stringify(items)
      )
      .run();

    return c.json({ orderId: result.meta.last_row_id });
  } catch (error) {
    console.error("Order creation error:", error);
    return c.json({ error: "Erro ao criar pedido" }, 500);
  }
});

// Get user orders
app.get("/api/orders/user/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");

    const result = await c.env.DB.prepare(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`
    )
      .bind(userId)
      .all();

    const orders = result.results.map((order: any) => ({
      ...order,
      items: JSON.parse(order.items),
    }));

    return c.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return c.json({ error: "Erro ao buscar pedidos" }, 500);
  }
});

// Get all orders (admin)
app.get("/api/orders", async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `SELECT * FROM orders ORDER BY created_at DESC`
    ).all();

    const orders = result.results.map((order: any) => ({
      ...order,
      items: JSON.parse(order.items),
    }));

    return c.json({ orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    return c.json({ error: "Erro ao buscar pedidos" }, 500);
  }
});

// Update order status
app.patch("/api/orders/:id/status", async (c) => {
  try {
    const orderId = c.req.param("id");
    const { status } = await c.req.json();

    await c.env.DB.prepare(
      `UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    )
      .bind(status, orderId)
      .run();

    return c.json({ success: true });
  } catch (error) {
    console.error("Update order error:", error);
    return c.json({ error: "Erro ao atualizar pedido" }, 500);
  }
});

// Webhook for payment notifications
app.post("/api/payments/webhook", async (c) => {
  try {
    const body = await c.req.json();
    
    // Log webhook for debugging
    console.log("Mercado Pago webhook:", body);

    if (body.type === "payment") {
      const paymentId = body.data.id;
      const accessToken = (c.env as any).MERCADO_PAGO_ACCESS_TOKEN;

      // Get payment details
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const payment = await response.json() as any;

      // Update order status based on payment status
      if (payment.status === "approved") {
        await c.env.DB.prepare(
          `UPDATE orders SET payment_status = 'approved', updated_at = CURRENT_TIMESTAMP 
           WHERE payment_id = ?`
        )
          .bind(paymentId)
          .run();
      } else if (payment.status === "rejected") {
        await c.env.DB.prepare(
          `UPDATE orders SET payment_status = 'rejected', updated_at = CURRENT_TIMESTAMP 
           WHERE payment_id = ?`
        )
          .bind(paymentId)
          .run();
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return c.json({ error: "Erro ao processar webhook" }, 500);
  }
});

export default app;
