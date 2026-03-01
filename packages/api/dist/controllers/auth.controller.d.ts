import { FastifyRequest, FastifyReply } from "fastify";
import { RegisterInput, LoginInput, RefreshTokenInput } from "../schemas/auth.schema";
export declare class AuthController {
    /**
     * Register a new user
     * POST /auth/register
     */
    register(request: FastifyRequest<{
        Body: RegisterInput;
    }>, reply: FastifyReply): Promise<void>;
    /**
     * Login with email and password
     * POST /auth/login
     */
    login(request: FastifyRequest<{
        Body: LoginInput;
    }>, reply: FastifyReply): Promise<void>;
    /**
     * Refresh access token
     * POST /auth/refresh
     */
    refresh(request: FastifyRequest<{
        Body: RefreshTokenInput;
    }>, reply: FastifyReply): Promise<void>;
    /**
     * Get current authenticated user
     * GET /auth/me
     */
    getCurrentUser(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    /**
     * Logout (client-side token removal in stateless JWT)
     * POST /auth/logout
     */
    logout(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    /**
     * Google OAuth callback
     * GET /auth/google/callback
     */
    googleCallback(_request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map