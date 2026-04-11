const jwt = require("jsonwebtoken");

const authMiddleware = async (req,res,next)=>{
   // 1. Header'dan token'ı çek (Bearer token formatında gelir)
    const authHeader = req.headers['authorization'];
    const token = await authHeader && authHeader.split(' ')[1]; // "Bearer <TOKEN>" kısmından sadece TOKEN'ı alır
  if(!token){
    res.status(404).json({message:"Gecersiz giriş"});
  }
  try {
  const decode = await jwt.verify(token,process.env.SECRET_KEY);
    req.user = decode;// yazmamız zorunlu req.user a token içeriğni ekliyoz controlerda kullanmak için
    
  } catch (err) {
     res.status(403).json({message:"Tekrar Giriş yapın"});
  }






 next();
};




module.exports = authMiddleware;