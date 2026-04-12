const pool = require("../db/userDatabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createApplication = async (req, res) => {
  const { baslik, icerik } = req.body;
  const vatandas_id = req.user.id; //req.user bilgisi authMiddleware dan geliyo
  try {
    const result = await pool.query(
      'INSERT INTO "basvurular" (baslik ,icerik,vatandas_id) VALUES ($1,$2,$3) RETURNING * ',
      [baslik, icerik, vatandas_id],
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

const usersGetApplication = async (req, res) => {
  const vatandas_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT baslik,icerik,durum FROM basvurular WHERE vatandas_id = $1`,
      [vatandas_id],
    );
    res.status(201).json({
      success: true,
      message: "Basvurular Listelendi",
      data: result.rows,
    });
  } catch (error) {
    console.error("HATA OLUŞTU:", error.message);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};

const adminGetApplication = async (req,res) => {
  try {
    const result = await pool.query(
      `SELECT b.id,k.ad_soyad,b.baslik,b.icerik,b.durum FROM basvurular b JOIN kullanicilar k ON k.id = b.vatandas_id 
       ORDER BY b.id DESC `
    );
    res.status(200).json({
      success: true,
      message: "Basvurular Listelendi",
      data: result.rows,
    });
  } catch (error) {
    console.error("HATA OLUŞTU:", error.message);
    res.status(500).json({ error: "Sunucu hatası" });
  }
};
  const updateApplication = async (req,res) =>{
    const { id } = req.params;
    const { durum } = req.body;
      try {
        const result = await pool.query(`UPDATE basvurular SET durum = $1 WHERE id = $2 RETURNING *`,[durum,id]);
        if(!result?.rows || result.rows.length === 0){
          return res.status(404).json({success:false,message:"Basvuru bulunamadı"});
        }
       return res.status(200).json({
      success: true,
      message: "Basvurulu güncellendi",
      data: result.rows,
    });
      } catch (error) {
         console.error("HATA OLUŞTU:", error.message);
    res.status(500).json({ error: "Sunucu hatası" });
      }




  }







module.exports = { createApplication, usersGetApplication,adminGetApplication,updateApplication};
