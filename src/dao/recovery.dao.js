import recoveryModel from "./models/recovery.model.js";

class recoveryDAO{
    constructor(){}

    async createRecovery(token_id,code){
        try{
             return await recoveryModel.create({"token_id":token_id,"code_id":code});
        }catch(error){
            console.log(error)
            return;
        }
    }
    async getRecovery(token_id,code){
        try{
            return await recoveryModel.findOne({"token_id":token_id,"code_id":code})
        }
        catch(error){
            throw error
        }
    }
    async deleteToken(token_id){
        try{
            return await recoveryModel.deleteOne({"token_id":token_id})
        }catch(error){
            throw error;
        }
    }
}
export default recoveryDAO;