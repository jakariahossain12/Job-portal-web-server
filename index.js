
require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const cors = require('cors');

const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_KEY}@cluster0.gjuhdnk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {

    const jobCollection = client
      .db("Job_Portal_db")
      .collection("Job_Chircular");
    
    
    const applicationCollection = client
      .db("Job_Portal_db")
      .collection("Applications");
    
    
    
    app.post('/jobs', async (req, res) => {
      const job = req.body;
      const result = await jobCollection.insertOne(job);
      res.send(result)
    })
    
    app.get('/jobs', async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.hr_email = email;
      }

      const course = jobCollection.find(query);
      const result = await course.toArray();
      res.send(result)
    })


    app.get('/jobs/:id', async (req, res) => {
      const id = req.params.id;
      
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result)
    })

    // application collection  Api


    app.post("/application", async (req, res) => {
      const application = req.body;
      const result = await applicationCollection.insertOne(application);
      res.send(result);
    });

    app.patch('/application/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const upDateDog = {
        $set: {
          stats: req.body.stats,
        }
      }
      const result = await applicationCollection.updateOne(filter, upDateDog);
      res.send(result)

    })

    app.get('/application', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await applicationCollection.find(query).toArray();
      // bad way
      for (const application of result) {
        const jobId = application.job_id;
        const query = { _id: new ObjectId(jobId) };
        const job = await jobCollection.findOne(query);
        application.company = job.company;
        application.title = job.title;
        application.company_logo = job.company_logo;
        application.location = job.location;
      }
      res.send(result);
    })

    app.get('/applicant/job/:id', async (req, res) => {
      const id = req.params.id;
      const query = { job_id:id };
      const result = await applicationCollection.find(query).toArray();
      res.send(result)

   })






    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});