import express from 'express';
import { graphService } from '../services/microsoft/graphClient';
import { prisma } from '../db/prisma';
import { asyncHandler } from './utils/asyncHandler';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Initiate Microsoft OAuth flow
 * GET /api/auth/microsoft/login
 */
router.get(
  '/login',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');

    const authUrl = graphService.getAuthUrl(state);

    res.json({
      authUrl,
      message: 'Redirect user to this URL to authorize calendar access',
    });
  })
);

/**
 * Microsoft OAuth callback
 * GET /api/auth/microsoft/callback
 */
router.get(
  '/callback',
  asyncHandler(async (req, res) => {
    const { code, state, error, error_description } = req.query;

    if (error) {
      logger.error({ error, error_description }, 'Microsoft OAuth error');
      return res.status(400).send(`
        <html>
          <body>
            <h1>Calendar Authorization Failed</h1>
            <p>${error_description || error}</p>
            <p><a href="/">Return to app</a></p>
          </body>
        </html>
      `);
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing authorization code');
    }

    try {
      // Decode state to get user ID
      const decodedState = JSON.parse(
        Buffer.from(state as string, 'base64').toString()
      );
      const userId = decodedState.userId;

      // Exchange code for tokens
      const tokens = await graphService.getTokenFromCode(code);

      // Get user info from Microsoft
      const userInfo = await graphService.getUserInfo(tokens.accessToken);

      // Calculate token expiry
      const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

      // Update user with Microsoft tokens
      await prisma.user.update({
        where: { id: userId },
        data: {
          microsoftAccessToken: tokens.accessToken,
          microsoftRefreshToken: tokens.refreshToken,
          microsoftTokenExpiry: expiresAt,
          microsoftEmail: userInfo.email,
          calendarSyncEnabled: true,
        },
      });

      logger.info(`Microsoft calendar authorized for user ${userId}`);

      res.send(`
        <html>
          <head>
            <style>
              body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; }
              h1 { color: #28a745; }
              .info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <h1>✓ Calendar Connected Successfully</h1>
            <div class="info">
              <p><strong>Connected Account:</strong> ${userInfo.email}</p>
              <p><strong>Display Name:</strong> ${userInfo.displayName}</p>
            </div>
            <p>Your Office 365 calendar is now connected. Appointments will automatically sync to your calendar.</p>
            <p><a href="/">Return to app</a></p>
          </body>
        </html>
      `);
    } catch (error: any) {
      logger.error({ err: error }, 'Error processing Microsoft callback');
      res.status(500).send(`
        <html>
          <body>
            <h1>Authorization Failed</h1>
            <p>${error.message}</p>
            <p><a href="/">Return to app</a></p>
          </body>
        </html>
      `);
    }
  })
);

/**
 * Disconnect Microsoft calendar
 * POST /api/auth/microsoft/disconnect
 */
router.post(
  '/disconnect',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    await prisma.user.update({
      where: { id: userId },
      data: {
        microsoftAccessToken: null,
        microsoftRefreshToken: null,
        microsoftTokenExpiry: null,
        microsoftEmail: null,
        calendarSyncEnabled: false,
      },
    });

    logger.info(`Microsoft calendar disconnected for user ${userId}`);

    res.json({
      message: 'Microsoft calendar disconnected successfully',
    });
  })
);

/**
 * Get Microsoft calendar connection status
 * GET /api/auth/microsoft/status
 */
router.get(
  '/status',
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        calendarSyncEnabled: true,
        microsoftEmail: true,
        microsoftTokenExpiry: true,
        microsoftAccessToken: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isConnected = user.calendarSyncEnabled && !!user.microsoftAccessToken;
    const isExpired = user.microsoftTokenExpiry
      ? new Date() > user.microsoftTokenExpiry
      : false;

    res.json({
      connected: isConnected,
      expired: isExpired,
      email: user.microsoftEmail,
      expiresAt: user.microsoftTokenExpiry,
    });
  })
);

export default router;
