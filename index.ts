import { Hono } from "hono";
import auth from "./auth";
import admin from "./admin";
import products from "./products";
import adminAuth from "./admin-auth";
import payments from "./payments";

const app = new Hono<{ Bindings: Env }>();

app.route("/", auth);
app.route("/", adminAuth);
app.route("/", admin);
app.route("/", products);
app.route("/", payments);

export default app;
