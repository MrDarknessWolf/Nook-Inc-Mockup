import * as chai from "chai"
import supertest from "supertest"
import mongoose from "mongoose"

import  config  from "./../src/config/env.config.js"
mongoose.connect(config.db);

const expect = chai.expect;

const requester = supertest("http://localhost:3000");

describe( " Testing of the Nook Inc Ecomerce API",()=>{
    const body = {
        email:"dummy@gmail.com",
        password:"dummy",
        cart_id:"65a8707aab708a6a006566b9"
    }
    describe("Test de productos ",()=>{
        let cookie={}
        before(async function(){
            this.timeout(50000)
            let logger =await requester.post("/api/sessions/login").send(body)
            let DemCookie=logger.header['set-cookie'][0]
            cookie.name=DemCookie.split('=')[0]
            cookie.value=DemCookie.split('=')[1]
            //console.log(cookie)
        })
        ////test 1 traer un producto segun un codigo id
        it("Debe trear un producto en especifico con su id", async () =>{
            const id_product ="655b8315a7705314057a7f84"
            const product= await requester
            .get(`/api/products/${id_product}`)
            .set('Cookie',[`${cookie.name}=${cookie.value}`])
            const response =product._body.message
            //console.log("reaching",response)
            expect(response._id).to.be.ok;
            expect(response).to.have.property("_id")
            expect(response._id).to.equal(id_product)
        })
        //test 2 no permite añadir si no es premium
        it("No se debe añadir un producto nuevo si el usario no es premium", async()=>{

            const paylod={
                showName: "new_item",
                title:"Rubber ducky",
                description:"Hey its a dummy item",
                owner:body.email,
                code:"DUMMY_ITEM",
                price:"69",
                stock:"69",
                category:"655b92be363b19dfbd005b5b",
                thumbnail:'https://dodo.ac/np/images/a/af/Leaf_NH_Icon.png'
            }

            const resp = await requester.post('/api/products/edit_items')
            .send(paylod)
            .set('Cookie',[`${cookie.name}=${cookie.value}`])
            //console.log(resp._body)
            expect(resp).to.be.ok
            expect(resp).to.have.property("_body")
            expect(resp._body.message).to.be.equal("UNAUTHORIZED")

        })
 
        it("El usario admin puede añadir cualquier producto",async ()=>{

            let logger =await requester.post("/api/sessions/login").send({email:"adminCoder@coder.com",password:"adminCod3r123"})
            let DemCookie=logger.header['set-cookie'][0]
            cookie.name=DemCookie.split('=')[0]
            cookie.value=DemCookie.split('=')[1]
            const paylod={
                showName: "new_item",
                title:"Rubber ducky",
                description:"Temporal item",
                owner:body.email,
                code:"DUMMY_ITEM",
                price:"69",
                stock:"69",
                category:"655b92be363b19dfbd005b5b",
                thumbnail:'https://dodo.ac/np/images/a/af/Leaf_NH_Icon.png'
            }
   
            const resp = await requester.post('/mockingproducts/edit_items')
            .send(paylod)
            .set('Cookie',[`${cookie.name}=${cookie.value}`])

            const data =resp.request._data
            expect(data).to.be.ok
            expect(data).to.have.property("code")
            expect(data.code).to.be.equal("DUMMY_ITEM")

        })

    })

    describe("Test de cart",()=>{
        let cookie={}
        before(async function(){
            this.timeout(50000)
            let logger =await requester.post("/api/sessions/login").send({email:body.email,password:body.password})
            let DemCookie=logger.header['set-cookie'][0]
            cookie.name=DemCookie.split('=')[0]
            cookie.value=DemCookie.split('=')[1]
            //console.log(cookie)
        })
        it("Getting the cart of the current user",async function(){
            const cart= await requester.get(`/api/cart/${body.cart_id}`)
            .set('Cookie',[`${cookie.name}=${cookie.value}`])
            expect(cart).to.be.ok
            expect(cart).to.have.property("text")
            expect(cart.text).to.be.equal('Found. Redirecting to /')
        })
        it("Current user shoudnt see others carts",async ()=>{
            const cart_other= await requester.get("/api/cart/65a86eb7b20092e7f81b4067")
            .set('Cookie',[`${cookie.name}=${cookie.value}`])
            expect(cart_other).to.be.ok
            expect(cart_other).to.have.property("text")
            expect(cart_other.text).to.be.equal('{"message":"UnAuthorized access"}')
            await requester.get(`/api/cart/${body.cart_id}`)
            .set('Cookie',[`${cookie.name}=${cookie.value}`])
        })
        it("If current role is admin, it shoudnt acess a cart",async ()=>{
            let logger =await requester.post("/api/sessions/login").send({email:"adminCoder@coder.com",password:"adminCod3r123"})
            let DemCookie=logger.header['set-cookie'][0]
            cookie.name=DemCookie.split('=')[0]
            cookie.value=DemCookie.split('=')[1]
            const admin_Cart = await requester.get("/api/cart")
            .set('Cookie',[`${cookie.name}=${cookie.value}`])

            expect(admin_Cart.statusCode).to.be.equal(404)
            expect(admin_Cart).to.have.property("text")
            expect(admin_Cart.text).to.be.equal('{"message":"ADMINS DONT HAVE CARTS"}')        
        });
    })

    ////////////test de sessions , cant register an allready in user, check if missing email, check if age bad
    describe("Test de Sessions",()=>{

        it("No se puede registar un usario que ya esta en el sistema", async ()=>{

            const new_user={
                name:"dummy",
                last_name:"3",
                email:body.email,
                age:"1999-07-24",
                password:body.password
            }
            const regist= await requester.post("/api/sessions/register")
            .send(new_user)

            //console.log(regist)

            expect(regist.statusCode).to.be.equal(500)
            expect(regist).to.have.property("text")
            expect(regist.text).to.be.equal('{"message":"Error, user already registered"}')  


        })

        it("Notificacion de clave o usario incorrecto", async()=>{
            const faker={
                email:body.email,
                password:"clearlywrongpass"
            }
            const bad_log = await requester.post("/api/sessions/login")
            .send(faker)

            //console.log(bad_log)
            expect(bad_log.statusCode).to.be.equal(501)
            expect(bad_log).to.have.property("text")
            expect(bad_log.text).to.be.equal('{"message":"User or password incorrect"}')
        })

        it("User cannot be underage",async ()=>{
            const new_user={
                name:"Clearly a minor",
                last_name:"3",
                email:"clearly@minor.com",
                age:"2015-07-24",
                password:"minorpassword"
            }

            const bad_request= await requester.post("/api/sessions/register")
            .send(new_user)
            //console.log(bad_request._body.message)

            expect(bad_request).to.be.ok
            expect(bad_request).to.have.property("_body")
            expect(bad_request._body.age).to.be.lessThan(18)
            expect(bad_request._body.message).to.be.equal("User must be over 18yrs")
            
            
        })
    })
})