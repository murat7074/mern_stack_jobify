import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (err, req, res, next) => { // bütün hatalar "err" ile yakalanacak
//   console.log(err); // authControllerden throw new Error u "err.message" olarak yakalayacağız // sonradan "class CustomAPIError extends Error" e çevirdik
  // authController.js de mongoose dan gelen "next(error)" (register try catch blok a bak)
  // veya "express-async-errors" den gelen server da import edildi.
  // hangisini kurduysan oradan hata mesajı gelecek
  const defaultError = {
    // // authControllerde "class CustomAPIError extends Error" yazdık ordan hata gönderilirse "err.StatusCode" u kullan
    statusCode:err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    // throw new Error varsa "err.message" ı kullan yoksa yanındakini string i kullan
    msg: err.message || 'Something went wrong, try again later',
  };
  if (err.name === 'ValidationError') {
    defaultError.statusCode = StatusCodes.BAD_REQUEST;
    // defaultError.msg = err.message  // aşağıda daha detaylı yazıcaz (postman deki mongodb den gelen hata mesajlarına dikkat et property isimleri aynı olabilir)
    defaultError.msg = Object.values(err.errors)  // objeleri erray haline getirip "map" leyip message lerini alıcaz
      .map((item) => item.message)
      .join(','); // mesajları bu hale getirdik  "msg": "Please provide password,Please provide email"
  }
  if(err.code && err.code === 11000){ // Farklı isim aynı email ile giriş yapınca
    defaultError.statusCode = StatusCodes.BAD_REQUEST;
    defaultError.msg = `${Object.keys(err.keyValue)} field has to be unique `
       //  "msg": "email field has to be unique "
  }
  // res.status(defaultError.StatusCode).json({ msg:err });
  res.status(defaultError.statusCode).json({ msg: defaultError.msg });
};

export default errorHandlerMiddleware;


/*   parçalamaya çalıştığımız ve mongodb den gelen msg

{
    "msg": {
        "errors": {
            "email": {
                "name": "ValidatorError",
                "message": "Please provide email",
                "properties": {
                    "message": "Please provide email",
                    "type": "required",
                    "path": "email"
                },
                "kind": "required",
                "path": "email"
            },
            "name": {
                "name": "ValidatorError",
                "message": "Please provide name",
                "properties": {
                    "message": "Please provide name",
                    "type": "required",
                    "path": "name"
                },
                "kind": "required",
                "path": "name"
            }
        },
        "_message": "User validation failed",
        "name": "ValidationError",
        "message": "User validation failed: email: Please provide email, name: Please provide name"
    }
}


*/

/* Farklı isim aynı email ile giriş yapınca

{
    "msg": {
        "index": 0,
        "code": 11000,
        "keyPattern": {
            "email": 1
        },
        "keyValue": {
            "email": "test1@gmail.com"
        }
    }
}



*/
