const pool =  require("../db/userDatabase");
const bcrypt =  require("bcryptjs");

const registerUser = async (req,res) => {
  const {tckn,ad_soyad,sifre_hash} = req.body;
  try{
      karmaSifre =  await bcrypt.hash(sifre_hash,10);
    const result = await pool.query('INSERT INTO "kullanicilar" (tckn ,ad_soyad ,sifre_hash) VALUES ($1,$2,$3) RETURNING * ',
     [tckn ,ad_soyad ,karmaSifre]);
    res.status(201).json({ 
    success: true, 
    message: "Kayıt gerçekleşti" 
});  }
   catch(err){
    console.error("HATA OLUŞTU:", err.message); 
    res.status(500).json({ error: "Sunucu hatası" });
   
   }
res.status(201).json({ 
    success: true, 
    message: "Kayıt gerçekleşti" 
});

}
module.exports = {registerUser};