export interface IUser {
  _id: string;
  email: string;
  name: string;
  passwordHash?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfile {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
}
