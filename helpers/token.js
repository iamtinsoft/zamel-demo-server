const jwt = require("jsonwebtoken");
const config = require("config");

function generateAuthToken(user) {
  const token = jwt.sign(
    {
      user_id: user.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_no: user.phone_no,
      role_id: user.role_id,
      role_name: user.role_name,
      is_active: user.is_active,
      is_verified: user.is_verified,
      created: user.created,
    },
    config.get("jwtPrivateKey")
  );
  return token;
}

exports.generateAuthToken = generateAuthToken;
