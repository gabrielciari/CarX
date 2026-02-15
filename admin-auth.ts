import { Hono } from "hono";
import bcrypt from "bcryptjs";

const app = new Hono<{ Bindings: Env }>();

// Admin login with username/password
app.post("/api/admin/login", async (c) => {
  const { username, password } = await c.req.json();

  if (!username || !password) {
    return c.json({ error: "Usuário e senha são obrigatórios" }, 400);
  }

  const admin = await c.env.DB.prepare(
    "SELECT * FROM admin_credentials WHERE username = ?"
  )
    .bind(username)
    .first();

  if (!admin) {
    return c.json({ error: "Usuário ou senha incorretos" }, 401);
  }

  const passwordMatch = await bcrypt.compare(password, admin.password_hash as string);

  if (!passwordMatch) {
    return c.json({ error: "Usuário ou senha incorretos" }, 401);
  }

  // Generate a simple session token
  const token = btoa(`${username}:${Date.now()}`);

  return c.json({ 
    success: true,
    token,
    message: "Login realizado com sucesso"
  });
});

// Middleware to check admin session
export const adminSessionMiddleware = async (c: any, next: any) => {
  const sessionToken = c.req.header("X-Admin-Session");
  
  if (!sessionToken) {
    return c.json({ error: "Sessão administrativa não encontrada" }, 401);
  }

  // Decode and validate token
  try {
    const decoded = atob(sessionToken);
    const [username] = decoded.split(":");
    
    const admin = await c.env.DB.prepare(
      "SELECT * FROM admin_credentials WHERE username = ?"
    )
      .bind(username)
      .first();

    if (!admin) {
      return c.json({ error: "Sessão inválida" }, 401);
    }

    c.set("adminUsername", username);
    await next();
  } catch (err) {
    return c.json({ error: "Sessão inválida" }, 401);
  }
};

export default app;
