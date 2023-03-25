
import jwt from "jsonwebtoken"
import {UnAuthenticatedError} from "../errors/index.js"

const auth = (req,res,next) =>{
  console.log(req.cookies);
 const authHeader = req.headers.authorization // token burada

 if(!authHeader || !authHeader.startsWith("Bearer")){
  throw new UnAuthenticatedError("Authentication Invalid")
 }
 const token = authHeader.split(' ')[1] // token ın önündeki Bearer ı çıkartıyoruz.
 try {
  const payload = jwt.verify(token, process.env.JWT_SECRET)
  // console.log(payload);
 /*  payload ==> {
  userId: '63e79a1a5cabe4e4aab5c552',  // "userId" i User Model de bu şekilde oluşturmuştuk jwt.sign({userId:this._id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_LIFETIME})
  iat: 1676478452,
   exp: 1676564852
 } */

 // ------------------------//
//  req.user = {userId:payload.userId} // test user ekliyeceğiz
// ------------------------//

 // TEST USER
    const testUser = payload.userId === '6416ffc24441d1bc9852bd4c'; // test user id
    req.user = { userId: payload.userId, testUser };
    // TEST USER


  next()  // sonraki middleware e aktarıyoruz

 } catch (error) {
   throw new UnAuthenticatedError("Authentication Invalid")
 }
}

export default auth

