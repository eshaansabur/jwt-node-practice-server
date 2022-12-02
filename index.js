const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000
const jwt = require('jsonwebtoken');


app.use(cors())
app.use(express.json())
require('dotenv').config()



app.get('/', (req, res) => {
  res.send('Hello World!')
})


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pngeuc6.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try 
    {
        await client.connect();
        console.log("DB connected");
        
        //DB Name and Collection
        const productCollection = client.db("gadgetfreak").collection("products");
        const orderCollection = client.db("gadgetfreak").collection("orders");
        
        //JWT SECURE LOGIN
        app.post('/login', (req, res) => {
            const email = req.body;
            //console.log(`Email ${email}`);
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
            //console.log(token);
            res.send({token});
        })
        //Upload Products
        app.post('/uploadPd', async(req, res) => {
            const product = req.body;
            console.log(product);
            const tokenInfo = req.headers.authorization;
            //console.log({tokenInfo});
            const [email, accessToken] = tokenInfo.split(' ');
            // verify a token symmetric - synchronous
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            //console.log(decoded, decoded.email);
            if(email === decoded.email){
                const result = await productCollection.insertOne(product);
                res.send({Success: 'Product upload Successfully'});
            }
            else{
                res.send({Success: "Unauthorized Access"});
            }
        })

        //get products
        app.get('/products', async(req, res) =>{
            const query = {};
            const products = await productCollection.find(query).toArray();
            res.send(products);
        })

        //Add order
        app.post('/addOrder', async(req, res) => {
            const orderInfo = req.body;
            //console.log(orderInfo);
            const result = orderCollection.insertOne(orderInfo);
            res.send({Success: "Order Sent successfully"})
        })

        app.get('/orderList', async(req, res) =>{
            const tokenInfo = req.headers.authorization;
            console.log({tokenInfo});
            const [email, accessToken] = tokenInfo.split(' ');
            // verify a token symmetric - synchronous
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            //console.log(decoded, decoded.email);
            if(email === decoded.email){
                const orders = await orderCollection.find({email: email}).toArray();
                console.log(orders);
                res.send(orders);
            }
            else{
                res.send({Success: "Unauthorized Access"});
            }

        })
    }
      
    finally
    {
      //await client.close();
    }
}

run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})