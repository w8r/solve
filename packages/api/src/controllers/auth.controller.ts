import { FastifyRequest, FastifyReply } from "fastify";
import { authService } from "../services/auth.service";
import { RegisterInput, LoginInput, RefreshTokenInput } from "../schemas/auth.schema";

export class AuthController {
  /**
   * Register a new user
   * POST /auth/register
   */
  async register(
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply,
  ): Promise<void> {
    const { user, tokens } = await authService.register(request.body);

    request.log.info({ userId: user._id, email: user.email }, "User registered successfully");

    void reply.status(201).send({
      user: {
        id: user._id,
        email: user.email,
        name: user.profile.name,
        avatar: user.profile.avatar,
        emailVerified: user.emailVerified,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  /**
   * Login with email and password
   * POST /auth/login
   */
  async login(request: FastifyRequest<{ Body: LoginInput }>, reply: FastifyReply): Promise<void> {
    const { user, tokens } = await authService.login(request.body);

    request.log.info({ userId: user._id, email: user.email }, "User logged in successfully");

    void reply.send({
      user: {
        id: user._id,
        email: user.email,
        name: user.profile.name,
        avatar: user.profile.avatar,
        emailVerified: user.emailVerified,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  async refresh(
    request: FastifyRequest<{ Body: RefreshTokenInput }>,
    reply: FastifyReply,
  ): Promise<void> {
    const tokens = await authService.refreshToken(request.body.refreshToken);

    request.log.info("Tokens refreshed successfully");

    void reply.send({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  }

  /**
   * Get current authenticated user
   * GET /auth/me
   */
  async getCurrentUser(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // User is attached to request by auth middleware
    const userId = request.user!.userId;

    const user = await authService.getUserById(userId);

    void reply.send({
      user: {
        id: user._id,
        email: user.email,
        name: user.profile.name,
        avatar: user.profile.avatar,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  }

  /**
   * Logout (client-side token removal in stateless JWT)
   * POST /auth/logout
   */
  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user!.userId;

    await authService.logout(userId);

    request.log.info({ userId }, "User logged out");

    void reply.send({ message: "Logged out successfully" });
  }

  /**
   * Google OAuth callback
   * GET /auth/google/callback
   */
  async googleCallback(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    // This will be implemented with Passport.js
    // For now, return a placeholder
    await reply.status(501).send({ message: "Google OAuth not yet implemented" });
  }
}

export const authController = new AuthController();
