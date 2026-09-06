const { OAuth2Client } = require("google-auth-library");

const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const client = GOOGLE_OAUTH_CLIENT_ID ? new OAuth2Client(GOOGLE_OAUTH_CLIENT_ID) : null;

// Fail closed: an empty allowlist means nobody gets in, not "everyone."
const requireAuth = async (req, res, next) => {
  if (ALLOWED_EMAILS.length === 0 || !GOOGLE_OAUTH_CLIENT_ID) {
    res.status(500).send("Relay is not configured (ALLOWED_EMAILS/GOOGLE_OAUTH_CLIENT_ID)");
    return;
  }

  const header = req.get("authorization") || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    res.status(401).send("Missing bearer token");
    return;
  }

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_OAUTH_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    res.status(401).send("Invalid or expired token");
    return;
  }

  const email = (payload?.email || "").toLowerCase();
  if (!payload?.email_verified || !email || !ALLOWED_EMAILS.includes(email)) {
    res.status(403).send("Not authorized");
    return;
  }

  req.userEmail = email;
  next();
};

module.exports = { requireAuth };
