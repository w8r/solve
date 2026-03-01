// Placeholder auth service - to be implemented in Phase 2
import { RegisterInput, LoginInput } from "../schemas/auth.schema";

interface User {
  _id: string;
  email: string;
  emailVerified: boolean;
  profile: {
    name: string;
    avatar?: string;
  };
  createdAt: Date;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(_input: RegisterInput): Promise<{ user: User; tokens: Tokens }> {
    throw new Error("Not implemented");
  }

  async login(_input: LoginInput): Promise<{ user: User; tokens: Tokens }> {
    throw new Error("Not implemented");
  }

  async refreshToken(_refreshToken: string): Promise<Tokens> {
    throw new Error("Not implemented");
  }

  async getUserById(_userId: string): Promise<User> {
    throw new Error("Not implemented");
  }

  async logout(_userId: string): Promise<void> {
    throw new Error("Not implemented");
  }
}

export const authService = new AuthService();
