import fs from "fs";
import path from "path";
import userCredentials from "../data/userCredentials.json";

/**
 * Central config for the evaire login suite.
 * Values come from .env (see .env.example) with safe defaults where possible.
 */
const ENV_FILE = path.resolve(__dirname, "../../../.env");
if (fs.existsSync(ENV_FILE)) {
  process.loadEnvFile(ENV_FILE);
}

const env = (name: string, fallback = ""): string =>
  (process.env[name] ?? fallback).trim();

export const evaireConfig = {
  baseUrl: env("EVAIRE_BASE_URL", "https://login.qa.evaire.ai"),
  apiBaseUrl: env("EVAIRE_API_BASE_URL", "https://api.login.qa.evaire.ai"),

  /** Main QA account (falls back to the Manager entry in userCredentials.json). */
  user: {
    username: env("EVAIRE_USERNAME", userCredentials.Manager.Username),
    password: env("EVAIRE_PASSWORD", userCredentials.Manager.Password),
    /** The account's email address - needed by TC-011 (case/whitespace). */
    email: env("EVAIRE_EMAIL"),
  },

  otp: {
    /** QA accepts a fixed OTP for every account. */
    code: env("OTP_CODE", "000000"),
    /** Code TC-016 submits as the "wrong" OTP (must differ from OTP_CODE). */
    wrongCode: env("OTP_WRONG_CODE", "111111"),
  },

  /** TC-013 and TC-022 only run when RUN_DESTRUCTIVE=1. */
  runDestructive: env("RUN_DESTRUCTIVE") === "1",

  /** TC-013 lockout policy - only run when the policy is documented. */
  lockout: {
    username: env("LOCKOUT_USERNAME"),
    password: env("LOCKOUT_PASSWORD"),
    threshold: Number(env("LOCKOUT_THRESHOLD", "0")),
    durationSec: Number(env("LOCKOUT_DURATION_SEC", "0")),
    /** Regex (case-insensitive) for the lockout message, e.g. "locked|too many". */
    messagePattern: env(
      "LOCKOUT_MESSAGE_PATTERN",
      "lock|too many|try again later",
    ),
  },
} as const;

export const testData = {
  wrongPassword: "WrongPass!123",
  unregisteredEmail: "qa.nouser.20261030@example.com",
  malformedIdentifiers: [
    "plainaddress",
    "user@",
    "@example.com",
    "user@@example.com",
    "user example@test.com",
  ],
};

export const messages = {
  pageTitle: "Eclat login",
  loginFailedTitle: "Login failed",
  loginFailed:
    "The username/email or password you entered is incorrect. Please try again",
  usernameRequired: "Username or email is required",
  passwordRequired: "Password is required",
  emailRequired: "Email is required",
  invalidEmail: "Invalid email address",
  otpHeading: "Please enter the verification code",
  otpSentTo: "We've sent you the code to",
  otpSentToast: "OTP sent to your email",
  otpInvalid: "Invalid OTP",
  otpMustBe6: "OTP must be 6 digits",
  welcome: "Welcome to the evaire product suite.",
  activeSession: "Active session detected",
  continueEndSession: "Continue & End Other Session",
  forgotHeading: "Forgot Password",
  forgotInstruction:
    "Enter your email address below and we will send you a link to reset your password",
};
