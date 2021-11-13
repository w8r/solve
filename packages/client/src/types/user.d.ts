export type User = {
  name: string;
  email: string;
  uuid: string;
  token?: string;
};

export interface GoogleAuthUser {
  email: string;
  family_name: string;
  given_name: string;
  id: string;
  locale: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

export interface FacebookAuthUser {
  email: string;
  first_name: string;
  last_name: string;
  id: string;
  name: string;
  picture: {
    data: {
      url: string;
      width: number;
    };
  };
}

export type UserAndToken = {
  token: string;
  user: User;
};
