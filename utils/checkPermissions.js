
import {UnAuthenticatedError} from "../errors/index.js"

const checkPermissions = (requestUser, resourceUserId)=>{
// jobsController.js de updateJob dan (ilk parametre ==> req.user, ikinci parametre (object) ==> job.createdBy)  geliyor
 // bu projede admin yok. Olsaydı burada kod yazacaktık.

 if(requestUser.userId === resourceUserId.toString()) return 
 throw new UnAuthenticatedError("Not authorized to access this route")

}




export default checkPermissions



