const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5001;

// middleware

app.use(cors());
app.use(express.json());


const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://<username>:<password>@cluster0.tqyfr7x.mongodb.net/?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tqyfr7x.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const taskCollection = client.db('TaskDB').collection('tasks');

    app.post('/tasks', async (req, res) => {
      const taskitem = req.body;
      const result = await taskCollection.insertOne(taskitem);
      res.send(result);
    })
    app.get('/tasks', async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    });

    app.get('/usertasks', async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          console.log(req.query?.email)
          query = { email: req.query.email };
        }
        const result = await taskCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });
    app.delete('/usertasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/usertasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.findOne(query);
      res.send(result);
    })
    app.put('/usertasks/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedItem = req.body;
      const item = {
        $set: {
          name: updatedItem.name,
          email: updatedItem.email,
          priority: updatedItem.priority,
          notes: updatedItem.notes,
          customerName: updatedItem.name,
          title: updatedItem.title,
          time: updatedItem.time,

        }
      };
      const result = await taskCollection.updateOne(filter, item, options);
      res.send(result);
    })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Task server is running')
})

app.listen(port, () => {
  console.log(`Task running on port ${port}`)
})