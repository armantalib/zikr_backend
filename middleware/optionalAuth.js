const jwt = require("jsonwebtoken");
const config = require("config");
const { User } = require("../models/user");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");
  // if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    if (token) {
      const decoded = jwt.verify(token, config.get("jwtPrivateKey")); //JWT need to be defined somewherelese
      req.user = decoded;
      const user = await User.findById(decoded._id).select("status");

      if (user.status == "online") {
        req.user = decoded;
        next();
      } else {
        return res
          .status(440)
          .send({
            message:
              "El usuario ha sido desactivado. Póngase en contacto con el administrador para obtener más ayuda.",
          });
      }
    } else {
      next();
    }
  } catch (ex) {
    res.status(400).send({message:"Acceso denegado. No se proporciona ninguna ficha."});
  }
};
