import express from "express";
import * as recovery from "../../Services/RecoveryService.js"
const router = express.Router();

router.get("/", (req, res) => {
  let data = {
    layout: "recoveryrequest",
  };
  res.render("index", data);
});
router.get("/:cid&:code",async(req,res)=>{
  try{
    const {cid,code} =req.params
    console.log(code)
    let check_id=await recovery.getRecovery(req.params.cid,req.params.code);
    if (!check_id){
      req.logger.warn("Token doesnt exist")
      return res.redirect("/recovery");
    }
    //console.log(check_id)
    let token_date=check_id.createDate.getDay();
    let token_hours=check_id.createDate.getHours();
    //let token_minutes =check_id.createDate.getMinutes();
    const now =new Date()
    //let now_mins=now.getMinutes();
    let now_hour=now.getHours();
    let now_date=now.getDay();
    let expiring=token_hours+1
    //console.log("current hour",now_hour,"token hour",token_hours)
    //console.log(now_mins)
    //console.log("expiring",expiring)
    if(now_hour>expiring || now_date>token_date){
      req.logger.warn("Expired token please try again")
      let destroy = await recovery.deleteToken(req.params.cid)
      return res.redirect("/recovery")
    }
    if(!check_id){
      req.logger.error("token not found")
      return res.redirect("/recovery")
    }else{
      req.logger.info("token exist loading")
      let data ={
        layout:"resetpass",
        cid:`${req.params.cid}`
      }
      res.render("index",data)}

}
  catch(error){console.log(error)}
})
export default router;