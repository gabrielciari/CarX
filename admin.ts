import { Hono } from "hono";
import { authMiddleware } from "@getmocha/users-service/backend";

const app = new Hono<{ Bindings: Env }>();

// Middleware to check if user is admin (via Google OAuth or username/password)
const adminMiddleware = async (c: any, next: any) => {
  // Check for admin session token first
  const sessionToken = c.req.header("X-Admin-Session");
  
  if (sessionToken) {
    try {
      const decoded = atob(sessionToken);
      const [username] = decoded.split(":");
      
      const adminCred = await c.env.DB.prepare(
        "SELECT * FROM admin_credentials WHERE username = ?"
      )
        .bind(username)
        .first();

      if (adminCred) {
        c.set("adminUsername", username);
        await next();
        return;
      }
    } catch (err) {
      // Invalid session token, continue to check Google OAuth
    }
  }

  // Check Google OAuth admin
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const admin = await c.env.DB.prepare(
    "SELECT * FROM admins WHERE user_id = ? OR email = ?"
  )
    .bind(user.id, user.email)
    .first();

  if (!admin) {
    return c.json({ error: "Access denied. Admin privileges required." }, 403);
  }

  await next();
};

// Check if current user is admin
app.get("/api/admin/check", authMiddleware, async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ isAdmin: false });
  }

  const admin = await c.env.DB.prepare(
    "SELECT * FROM admins WHERE user_id = ? OR email = ?"
  )
    .bind(user.id, user.email)
    .first();

  return c.json({ isAdmin: !!admin });
});

// Get all products (admin only)
app.get("/api/admin/products", authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM products ORDER BY created_at DESC"
  ).all();

  return c.json(results);
});

// Create product (admin only)
app.post("/api/admin/products", authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();

  if (!body.name || !body.price || !body.image || !body.category || !body.variation) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  const result = await c.env.DB.prepare(
    "INSERT INTO products (name, price, image, category, variation, is_active) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(body.name, body.price, body.image, body.category, body.variation, body.is_active ? 1 : 0)
    .run();

  return c.json({ id: result.meta.last_row_id, ...body }, 201);
});

// Update product (admin only)
app.put("/api/admin/products/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  await c.env.DB.prepare(
    "UPDATE products SET name = ?, price = ?, image = ?, category = ?, variation = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  )
    .bind(
      body.name,
      body.price,
      body.image,
      body.category,
      body.variation,
      body.is_active ? 1 : 0,
      id
    )
    .run();

  return c.json({ id, ...body });
});

// Delete product (admin only)
app.delete("/api/admin/products/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

// Add admin (admin only)
app.post("/api/admin/admins", authMiddleware, adminMiddleware, async (c) => {
  const body = await c.req.json();

  if (!body.email) {
    return c.json({ error: "Email is required" }, 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO admins (user_id, email) VALUES (?, ?)"
  )
    .bind("", body.email)
    .run();

  return c.json({ email: body.email }, 201);
});

// Get all admins (admin only)
app.get("/api/admin/admins", authMiddleware, adminMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, email, created_at FROM admins ORDER BY created_at DESC"
  ).all();

  return c.json(results);
});

// Remove admin (admin only)
app.delete("/api/admin/admins/:id", authMiddleware, adminMiddleware, async (c) => {
  const id = c.req.param("id");

  await c.env.DB.prepare("DELETE FROM admins WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

export default app;
