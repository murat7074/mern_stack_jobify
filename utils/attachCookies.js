



const attachCookies = ({res,token}) =>{
 const oneDay = 1000 * 60 * 60 * 24 
 // res.cookie(name, value [, options])
  res.cookie("token",token,{
    httpOnly:true,
    expires: new Date(Date.now() + oneDay), 
    secure:process.env.NODE_ENV === "production", // production da sadece "https" de çalışacak
  })
}


export default attachCookies