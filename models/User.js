import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minLength: 3,
    maxLength: 20,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail, // https://www.npmjs.com/package/validator den nasıl kullanıldığına bakabilirsin.
      message: 'Please provide a valid email',
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minLength: 6,
    select: false, // user ın bilgilerini mongodb den alıcağımız zaman password gelmeyecek fakat .select("+password") ile çağırabilirsin
  },
  lastName: {
    type: String,
    trim: true,
    maxLength: 20,
    default: 'lastName',
  },
  location: {
    type: String,
    trim: true,
    maxLength: 20,
    default: 'my city',
  },
});

//-----  MONGOOSE MIDDLEWARE  -----//
// her function bunu tetiklemez Örnek User.findOneAndUpdate() gibi
UserSchema.pre('save', async function () {
  // console.log(this.modifiedPaths()); // "email,name,lastName, location" hangisi değişiyorsa onu yakalıyor (UserSchema daki değişen bilgileri yakalayabilir)
  // console.log(this.isModified("name")); // "name" de değişiklik varsa "true" döner

  if (!this.isModified('password')) return;  // "password" değişmediyse aşağıdaki kodlara girme
  // register olurken veya password değiştiyse hash yapmalıyız
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  //----HASH with BCRYPTJS---- (Kullanıcı update yaptığında hata veriyor)//
  // console.log(this.password)  // kullanıcının girdiği passwordu görebiliriz
  // const salt = await bcrypt.genSalt(10)
  // // mutate the user's password
  // this.password = await bcrypt.hash(this.password,salt)

  // console.log(this.password) // kriptolandı ve mongodb ye bu şekilde gönderilecek  $2a$10$k/EabjeuhLNwdSY12CyRX.mjWPJiU.fi4zsguL6j7Gq5mPuCVtjGa
  //----HASH with BCRYPTJS----//
});

//-----  JWT  -----//
UserSchema.methods.createJWT = function () {
  // authController de invoke et "user.createJWT()"
  // console.log(this)
  /* 
  {
  name: 'bug',
  email: 'test4@gmail.com',
  password: '$2a$10$X4YrCmwujfdBxqejTuQmIuo1..UGOgYW3YfNVEv29Fei4SqGTjkoi
',
  lastName: 'lastName',
  location: 'my city',
  _id: new ObjectId("63e27e3886bcffe7dbb6abf7"),
  __v: 0
}
  */
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model('User', UserSchema);
