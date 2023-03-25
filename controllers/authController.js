import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import {
  NotFoundError,
  BadRequestError,
  UnAuthenticatedError,
} from '../errors/index.js'; // server tarafında bu şekilde import ediyoruz. (mutlaka sonunda js olucak ve varsa index yazılacak)
// DİKKAT yorumlarda sıkıntı olabilir (Çok fazla sayıda refactoring oldu)
// mongodb den hata kodları geliyor fakat biz yinede kendi hata kodlarımızıda yazmalıyız (ya gelmezse ): )

import attachCookies from "../utils/attachCookies.js"

const register = async (req, res) => {
  const { name, email, password } = req.body;
  // if (!name || !email || !password) {
  //   throw new Error('please provide all values'); // "err.message" olarak error-handler da yakalanacak (message new Error un kendine has property si)
  // }
  if (!name || !email || !password) {
    throw new BadRequestError('please provide all values'); // "err.message" olarak error-handler da yakalanacak (message new Error un kendine has property si)
  }

  const userAlreadyExist = await User.findOne({ email });
  if (userAlreadyExist) {
    throw new BadRequestError('Email already in use');
  }

  const user = await User.create({ name, email, password });
  const token = user.createJWT();

  attachCookies({res,token})

  res.status(StatusCodes.CREATED).json({
    user: {
      // user a istediğimiz bilgileri istediğimiz formatta gönderelim
      email: user.email,
      lastName: user.lastName,
      location: user.location,
      name: user.name,
    },
    // token, // cookies de gerek kalmadı
    location: user.location,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ email }).select("+password"); // .select("+password") yazmassak password u kontrol edemeyiz 
  if (!user) {
    throw new UnAuthenticatedError('Invalid Credentials');
  }
  // console.log(user);
  const isPasswordCorrect = await user.comparePassword(password); // password ü kontrol edeceğiz
  if (!isPasswordCorrect) {
    throw new UnAuthenticatedError('Invalid Credentials');
  }

  const token = user.createJWT()  // tekrar token oluşturalım
  user.password=undefined  // hassas "password" bilgisini göndermeyelim

  attachCookies({res,token})

  // res.status(StatusCodes.OK).json({user,token,location:user.location})
  res.status(StatusCodes.OK).json({user,location:user.location})
};

const updateUser = async (req, res) => {
  // console.log(req.user);
  // auth.js de  bu şekilde güncellemiştik ===> req.user = {userId:payload.userId}
 
   const { email,name,lastName, location } = req.body;
  if (!email || !name || !lastName || !location) {
    throw new BadRequestError('Please provide all values');
  }
 
  const user = await User.findOne({_id:req.user.userId})

  //-- update values --//
  user.email= email;
  user.name= name;
  user.lastName= lastName;
  user.location= location;

  await user.save() // User model de "pre" methodunu  invoke eder
  // yeni token üretelim tabiki bu bir tercih
  const token = user.createJWT()

  attachCookies({res,token})

//  res.status(StatusCodes.OK).json({user,token,location:user.location})
 res.status(StatusCodes.OK).json({user,location:user.location})
};

// ÖNEMLİ NOT
/*  //  cookies i kullanınca frontend deki locale storageden token, user ve location u sildik
    fakat sayfayı yenileyince user kaydedilmediğinden logout oluyoruz.
    login olduktan sonra user a her sayfa yenilendiğinde ulaşmak için  "getCurrentUser" ı kullanacağız
 
 
    const addUserToLocalStorage = ({ user, token, location }) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('location', location);
  }; 
    
  */

const getCurrentUser = async (req,res) =>{
const user = await User.findOne({_id:req.user.userId})
res.status(StatusCodes.OK).json({user,location:user.location})
}

// logout olduktan hemen sonra cookie silinsin. Aksi takdirde user sayfayı yenilediğinde tekrar login olur
const logout = async (req,res) =>{
res.cookie("token","logout",{
  httpOnly:true,
  expires:new Date(Date.now())
})
res.status(StatusCodes.OK).json({msg:"user logged out!"})
}



export { register, login, updateUser,getCurrentUser,logout };
