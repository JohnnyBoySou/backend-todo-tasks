const { admin } = require("../config/firebase");

exports.login = async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return res.status(200).json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};
