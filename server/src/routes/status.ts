import { Router } from "express";
import { z } from "zod";
import prisma from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.get("/:userId", requireAuth, async (req, res) => {
  const userId = req.params.userId;
  const claims = (req as any).user as { userId: string };
  if (claims.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });

  try {
    const rows = await prisma.statusData.findMany({
      select: { dataKey: true, statusValue: true },
    });

    const mergedData: Record<string, string> = {};
    rows.forEach((row) => {
      mergedData[row.dataKey] = row.statusValue;
    });

    return res.json({ data: mergedData });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/:userId", requireAuth, async (req, res) => {
  const userId = req.params.userId;
  const claims = (req as any).user as { userId: string };
  if (claims.userId !== userId)
    return res.status(403).json({ error: "Forbidden" });

  const parse = z
    .object({ statusData: z.record(z.string()) })
    .safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid input" });

  const { statusData } = parse.data;
  const numericUserId = parseInt(userId);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.statusData.deleteMany({
        where: { userId: numericUserId },
      });

      const entries = Object.entries(statusData).map(([dataKey, statusValue]) => ({
        userId: numericUserId,
        dataKey,
        statusValue,
        updatedBy: numericUserId,
      }));

      await tx.statusData.createMany({ data: entries });
    });

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/public/all", async (_req, res) => {
  try {
    const rows = await prisma.statusData.findMany({
      select: { dataKey: true, statusValue: true },
    });

    const mergedData: Record<string, string> = {};
    rows.forEach((row) => {
      mergedData[row.dataKey] = row.statusValue;
    });

    return res.json({ data: mergedData });
  } catch (err) {
    return res.json({ data: {} });
  }
});

export default router;
