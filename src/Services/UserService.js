import UserDAO from "../dao/users.dao.js";

const Users = new UserDAO();

const getUser=(username)=>{
    return Users.getUser(username);
}

const addUser=(user_info)=>{
    return Users.addUser(user_info);
}
const resetPass=(email,pass)=>{
    return Users.resetPass(email,pass);
}

const getbyID=(userID)=>{
    return Users.getbyID(userID)
}
const premuser=(uid,role)=>{
    return Users.premuser(uid,role)
}

const last_connect = (id,connection)=>{
    return Users.last_connect(id,connection)
}

const upload_file = (id,document)=>{
    return Users.upload_file(id,document);
}

const check_files =(id)=>{
    return Users.check_files(id)
}

export { getUser,getbyID,addUser,premuser,resetPass, last_connect,upload_file,check_files}