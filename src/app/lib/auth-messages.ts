export const AUTH_ERRORS: Record<string, string> = {
  invalid_form: "Please check your details and try again. Passwords need at least 8 characters.",
  bad_credentials: "Incorrect email or password.",
  unconfirmed: "Please confirm your email address first. Check your inbox.",
  exists: "An account with this email already exists. Try signing in instead.",
  weak: "That password is too weak. Try a longer one.",
  invalid_email: "That email address isn't accepted. Try a different one.",
  rate_limit: "Too many attempts. Please wait a few minutes and try again.",
  signup_disabled: "Sign-ups are currently turned off.",
  callback: "We couldn't sign you in. Please try again.",
  generic: "Something went wrong. Please try again.",
};

export const AUTH_INFO: Record<string, string> = {
  confirm: "Account created. Check your email to confirm it, then sign in.",
};