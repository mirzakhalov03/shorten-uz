import { Router } from "express";
import { createShortLink, getUserLinks, deleteLink } from "../controllers/url.controller";
import { authenticate, optionalAuthenticate } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/urls:
 *   post:
 *     tags:
 *       - URLs
 *     summary: Create a short link (works for guests and signed-in users)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [originalLink]
 *             properties:
 *               originalLink:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Short link created
 */
router.post("/", optionalAuthenticate, createShortLink);

/**
 * @openapi
 * /api/urls:
 *   get:
 *     tags:
 *       - URLs
 *     summary: Get all links for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User links list
 */
router.get("/", authenticate, getUserLinks);

/**
 * @openapi
 * /api/urls/{id}:
 *   delete:
 *     tags:
 *       - URLs
 *     summary: Delete a link by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Link deleted
 */
router.delete("/:id", authenticate, deleteLink);

export default router;
