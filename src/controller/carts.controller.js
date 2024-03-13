import {Router} from "express";
//import CartsDAO from "../dao/carts.dao.js";
import * as carts from "../Services/CartService.js"
import * as users from "../Services/UserService.js"
import io from '../app.js'

/////////////////////////errors
import CustomError from "../utils/Custom.error.js";
import * as InfoError from "../utils/info.error.js"
import EnumError from "../utils/enum.error.js";
//////////////////////////

const cartRouter = Router();
//const carts=new CartsDAO()

cartRouter.get("/",async (req, res)=>{

    if(req.session.user===undefined){
        CustomError.createError({
          name:"User Session error",
          cause:InfoError.generateUserSesErrorInfo(),
          message:"Session has closed",
          code:EnumError.ROUTING_ERROR
        });
        req.logger.warn("Session has expired, redirecting")        
        res.redirect("/")
        return;
    }
    try{
        console.log(req.session.user)
        if(req.session.user.role=="ADMIN"){
            return res.status(404).json({message:"ADMINS DONT HAVE CARTS"})
        }
        const current_id =req.session.user._id
        res.redirect(`/api/cart/${current_id}`)

    }catch(error){
        res.status(501).json({message:error.message})//////replace the error
    }
})
cartRouter.get("/:cid",async(req,res)=>{
    try{
    if(req.session.user===undefined){
        CustomError.createError({
          name:"User Session error",
          cause:InfoError.generateUserSesErrorInfo(),
          message:"Session has closed",
          code:EnumError.ROUTING_ERROR
        });        
        res.redirect("/")
        return;
    }
    

    if(req.params.cid==="ticket"){
        //console.log("oop")
        return res.redirect("/api/cart/ticket")
    }
    //console.log(req.params)
    const current_user =await users.getbyID(req.params.cid)
    //console.log(current_user,req.session.user)
    //const current_user=req.session.user
    const user_name=current_user.name//req.session.user.name
    if(current_user._id!==req.session.user._id){
        res.status(500).json({message:"UnAuthorized access"})
    }
    const cart= await carts.getCart(user_name)
    const products = cart.products
    //console.log("cart found",current_user)
    res.render('index',{
        layout:'cart'
        ,cart,current_user})
    }catch(error){
        CustomError.createError({
            name:"User Session error",
            cause:InfoError.generateRoutingErrorInfo(),
            message:"Acess denied",
            code:EnumError.ROUTING_ERROR
          });        
          res.redirect("/")
    }
})
cartRouter.get("/:cid/payment",async(req,res)=>{
    if(req.session.user===undefined){
        CustomError.createError({
          name:"User Session error",
          cause:InfoError.generateRoutingErrorInfo(),
          message:"Acess denied",
          code:EnumError.ROUTING_ERROR
        });        
        res.redirect("/")
        return;
    }
    //console.log(req.params.cid)
    const params=req.params.cid
    const current_user =await users.getbyID(params)
    //console.log(current_user)
    const user_name=current_user.name
    //const current_user=req.session.user
    const cart= await carts.getCart(user_name)
    const products = cart.products
    //console.log("Lets go pay",cart)
    //console.log(cart)
    req.logger.http("Proceeding to transaction of items")
    res.render('index',{
        layout:'payment'
        ,cart})
})
/*
cartRouter.get("/:cid/ticket",async(req,res)=>{
    console.log("payment yime")
    res.status(201).json({Message:"success"})
})*/
export default cartRouter;