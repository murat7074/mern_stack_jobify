
import mongoose from 'mongoose';

const connectDB = (url) => {
  mongoose.set('strictQuery', true); // bu kodu yazmassan "DeprecationWarning:" uyarısı veriyor
  return mongoose.connect(url);
};

export default connectDB;
