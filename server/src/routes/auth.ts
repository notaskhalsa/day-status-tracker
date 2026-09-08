import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "../db.js";
import { signJwt } from "../auth.js";

const router = Router();

const email = z.string().email();
const password = z.string().min(8).max(128);
const name = z.string().min(1).max(100);

router.post("/signup", async (req, res) => {
  const parse = z.object({ email, password, name }).safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { email: e, password: p, name: n } = parse.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email: e } });
    if (existing) {
      return res.status(409).json({ error: "Email in use" });
    }

    const hash = await bcrypt.hash(p, 12);
    const user = await prisma.user.create({
      data: { email: e, passwordHash: hash, name: n },
    });

    const userId = user.id.toString();
    const token = signJwt({ userId, email: e });
    return res.json({ userId, token });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const parse = z.object({ email, password }).safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });
  const { email: e, password: p } = parse.data;

  try {
    const user = await prisma.user.findUnique({ where: { email: e } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(p, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const userId = user.id.toString();
    const token = signJwt({ userId, email: e });
    return res.json({ userId, token });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
