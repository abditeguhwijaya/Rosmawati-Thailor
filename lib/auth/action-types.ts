export type LoginState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  values?: { email?: string };
};

export type ChangePasswordState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
