
const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);
  // authController.js de mongoose dan gelen "next(error)" (register try catch blok a bak)  
  // veya "express-async-errors" den gelen server da import edildi. 
  // hangisini kurduysan oradan hata mesajı gelecek

  res.status(500).json({ msg:err }); 
};

export default errorHandlerMiddleware;
