import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

// Get all active products (public)
app.get("/api/products", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC"
  ).all();

  return c.json(results);
});

export default app;
