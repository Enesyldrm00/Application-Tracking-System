const pool = require("../db/userDatabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createApplication = async (req, res) => {
  const { baslik, icerik } = req.body;
  const vatandas_id = req.user.id;//req.user bilgisi authMiddleware dan geliyo
  try {
    const result = await pool.query(
      'INSERT INTO "basvurular" (baslik ,icerik,vatandas_id) VALUES ($1,$2,$3) RETURNING * ',
      [baslik, icerik,  vatandas_id],
    );
    res.status(201).json({
      success: true,
      message: "Basvuru  gerçekleşti",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("HATA OLUŞTU:", err.message);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

module.exports = { createApplication };
