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
export declare class AuthService {
    register(_input: RegisterInput): Promise<{
        user: User;
        tokens: Tokens;
    }>;
    login(_input: LoginInput): Promise<{
        user: User;
        tokens: Tokens;
    }>;
    refreshToken(_refreshToken: string): Promise<Tokens>;
    getUserById(_userId: string): Promise<User>;
    logout(_userId: string): Promise<void>;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map