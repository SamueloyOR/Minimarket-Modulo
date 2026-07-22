const express= require("express");
const app= express();
const port= 3000;
app.get("/",(req, res)=>{
    res.send("hola mundo");
});
app.listen(port, ()=>{
    console.log("corriendo servidor en el puerto 3000") 
});