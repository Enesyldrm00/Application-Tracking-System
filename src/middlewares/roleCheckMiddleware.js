

const roleCheckMiddleware = async (req,res,next) =>{
  
 if (!req.user) {
        return res.status(401).json({ message: "Önce giriş yapmalısın" });
    }

    
    if (req.user.rol !== 'memur') {
        return res.status(403).json({ 
            message: "Yetkisiz erişim! Bu kapı sadece memurlara açık." 
        });
    }

 
next();
}










module.exports = roleCheckMiddleware;