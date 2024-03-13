import recoveryDAO from "../dao/recovery.dao.js";
const recovery=new recoveryDAO();

const createRecovery=(token_id,code)=>{
    return recovery.createRecovery(token_id,code);
}

const getRecovery=(token_id,code)=>{
    return recovery.getRecovery(token_id,code)
}
const deleteToken=(token_id)=>{
    return recovery.deleteToken(token_id);
}
export {createRecovery,deleteToken,getRecovery};