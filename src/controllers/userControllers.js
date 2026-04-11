const pool = require("../db/userDatabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { tckn, ad_soyad, sifre_hash } = req.body;
  try {
    karmaSifre = await bcrypt.hash(sifre_hash, 10);
    const result = await pool.query(
      'INSERT INTO "kullanicilar" (tckn ,ad_soyad ,sifre_hash) VALUES ($1,$2,$3) RETURNING * ',
      [tckn, ad_soyad, karmaSifre],
    );
    res.status(201).json({
      success: true,
      message: "Kayıt gerçekleşti",
    });
  } catch (err) {
    console.error("HATA OLUŞTU:", err.message);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

const loginUser = async (req, res) => {
  const { tckn, sifre_hash } = req.body;
  const result = await pool.query(
    `SELECT id,tckn,sifre_hash,rol  FROM kullanicilar WHERE tckn = $1`,
    [tckn],
  );
  if (result.rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "T.C. No veya şifre hatalı!" });
  } else {
    const karmaSifre = result.rows[0].sifre_hash;
    try {
      const karsilastir = await bcrypt.compare(sifre_hash, karmaSifre);
      if (karsilastir === true) {
        const token = await jwt.sign(
          { id: result.rows[0].id, rol: result.rows[0].rol },
          process.env.SECRET_KEY,
          { expiresIn: "1h" },
        );
        return res.status(201).json({
          success: true,
          token: token,// bu satırla frontende tokeni gönderiyoz.
          message: "Giriş gerçekleşti",
        });
      } else {
        return res
          .status(401)
          .json({ success: false, message: "Şifre hatalı!" });
      }
    } catch (err) {
      console.error("HATA OLUŞTU:", err.message);
      return res
        .status(500)
        .json({ success: false, message: "Sunucu hatası oluştu!" });
    }
  }
};

module.exports = { registerUser, loginUser };
