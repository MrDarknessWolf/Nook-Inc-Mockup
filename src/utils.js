import multer from 'multer';
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import passport from "passport";
import path from 'path';
import fs from 'fs'

import io from "./app.js"

////////////////////////
import "dotenv/config.js";

import {fileURLToPath} from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//////////////////hashing de las contraseñas
export const createHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) =>
  bcrypt.compareSync(password, user.password);


export default __dirname;
////////////////////////////////////
const KEYSECRET = "TheDemonSeeksKnowledge"
export const generateToken =  ( user ) =>{
  const token =  jwt.sign({user},KEYSECRET,{expiresIn:'1d'});
  return token;
}

export const authToken = (req,res,next) =>{
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).send({status:"error",error:"Unauthorized"})
  console.log(authHeader);
  const token = authHeader.split(' ')[1];
  jwt.verify(token,KEYSECRET,(error,credentials)=>{
      console.log(error);
      if(error) return res.status(401).send({status:"error",error:"Unauthorized"})
      req.user = credentials.user;
      next();
  })
}

export const passportCall = (strategy) => {
  return async (req, res, next) => {
    passport.authenticate(strategy, function (err, user, info) {
      
      if (err) return next(err);
      if (!user) {
        return res
          .status(401)
          .send({ error: info.messages?.info, messages: info.toString() });
      }
      req.user = user;
      next();
    })(req, res, next);
  };
};



export const authorization = (role) => {
  return async (req, res, next) => {
   
    if (!req.user) return res.status(401).send({ error: "Unauthorized" });
    if (req.user.user.role != role)
      return res.status(403).send({ error: "No Permissions" });

    next();
  };
};



////////////////////// MULTER
const storage = multer.diskStorage({
  destination: (req, files,cb)=>{
    io.emit("uploading")
    const folder_id = req.params.uid
    const mainFolderPath = path.join(__dirname,"private_docs",folder_id)

    const selectedSubFolder=files.fieldname
    //console.log("Reciving :",files.fieldname)
    let destinationPath;
    switch(selectedSubFolder){
      case "ID":
        destinationPath= path.join(mainFolderPath,"ID")
        break;
      case "RESIDENCE":
        destinationPath= path.join(mainFolderPath,"RESIDENCE")
        break;
      case "BANK_PROFF":
        destinationPath= path.join(mainFolderPath,"BANK_PROFF")     
        break;
      case "PROFILE_PIC":
        destinationPath = path.join(mainFolderPath,"PROFILE_PIC");
        break;
      default:
    }
    //console.log(destinationPath)
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath,{recursive: true});
    }
    else{
      //for overiding info so the files arent multiplying
      //console.log(files)
      switch(selectedSubFolder){
        case "ID":
          destinationPath= path.join(mainFolderPath,"ID")
          fs.rmSync(destinationPath,{recursive: true})
          fs.mkdirSync(destinationPath,{recursive: true})
          break;
        case "RESIDENCE":
          destinationPath= path.join(mainFolderPath,"RESIDENCE")
          fs.rmSync(destinationPath,{recursive: true})
          fs.mkdirSync(destinationPath,{recursive: true})
          break;
        case "BANK_PROFF":
          destinationPath= path.join(mainFolderPath,"BANK_PROFF") 
          fs.rmSync(destinationPath,{recursive: true})   
          fs.mkdirSync(destinationPath,{recursive: true}) 
          break;
        case "PROFILE_PIC":
          destinationPath = path.join(mainFolderPath,"PROFILE_PIC");
          fs.rmSync(destinationPath,{recursive: true})
          fs.mkdirSync(destinationPath,{recursive: true})
          break;
        default:
      
        }
  }
    cb(null,destinationPath)
    //const destinationPath = path.join(__dirname,'private_docs',folderName)
    //console.log("saving")
    io.emit("finished")
  },
  filename:(req,files,cb)=>{
    //console.log(files)
  cb(null,files.originalname)
  } // Carpeta donde se guardarán los archivos

});
export const uploader = multer({ storage });
