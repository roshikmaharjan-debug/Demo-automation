type LoginOutcome = { type: "inventory" } | { type: "error"; message: string };

type User = {
  username: string;
  password: string;
  expected: LoginOutcome;
};

export const users: User[] = [
  {
    username: "standard_user",
    password: "secret_sauce",
    expected: { type: "inventory" },
  },
  {
    username: "locked_out_user",
    password: "secret_sauce",
    expected: {
      type: "error",
      message: "Epic sadface: Sorry, this user has been locked out.",
    },
  },
  {
    username: "problem_user",
    password: "secret_sauce",
    expected: { type: "inventory" },
  },
  {
    username: "performance_glitch_user",
    password: "secret_sauce",
    expected: { type: "inventory" },
  },
  {
    username: "error_user",
    password: "secret_sauce",
    expected: { type: "inventory" },
  },
  {
    username: "visual_user",
    password: "secret_sauce",
    expected: { type: "inventory" },
  },
];
