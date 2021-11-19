const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.Port || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hta0c.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);
async function run() {
    try {
        await client.connect();
        // console.log('connected to database');
        const database = client.db("travel_Ride");
        const toursCollection = database.collection("tours");
        const bookingCollection = database.collection('tour_booking');

        //Get Tours API
        app.get('/tours', async (req, res) => {
            const cursor = toursCollection.find({});
            const tours = await cursor.toArray();
            res.send(tours);
        });

        // POST API
        app.post('/tours', async (req, res) => {
            const tour = req.body;
            console.log('hit the post api', tour);
            // res.send('post hitted');

            const result = await toursCollection.insertOne(tour);
            console.log(result);
            res.json(result);
        });
        // Get Single Tour
        app.get('/getservices/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific tour', id);
            const query = { _id: ObjectId(id) };
            const tour = await toursCollection.findOne(query);
            res.json(tour);
        });
        //Add Booking API
        app.post('/tour_booking', async (req, res) => {
            const booking = req.body;
            // console.log('booking', booking);
            // res.send('Booking processed');
            const result = await bookingCollection.insertOne(booking);
            res.json(result);
        });
        // DELETE API
        app.delete('/getservices/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific tour', id);
            const query = { _id: ObjectId(id) };
            const result = await toursCollection.deleteOne(query);
            res.json(result);
        });
        //Get Booking API
        // app.get('/tour_booking', async (req, res) => {
        //     const cursor = bookingCollection.find({});
        //     const allBooking = await cursor.toArray();
        //     res.send(allBooking);
        // });
        app.get('/tour_booking/:email', async (req, res) => {
            const result = await bookingCollection
                .find({ email: req.params.email })
                .toArray();
            // console.log(result);
            res.send(result);
        });
        // DELETE Booking API
        app.delete('/delete_booking/:id', async (req, res) => {
            const result = await bookingCollection.deleteOne({ _id: ObjectId(req.params.id) });
            // console.log(result);
            res.json(result);
        });
        // All Booking
        app.get("/allBooking", async (req, res) => {
            const result = await bookingCollection.find({}).toArray();
            res.send(result);
        });
        // update statuses

        app.put("/updateStatus/:id", (req, res) => {
            const id = req.params.id;
            const updatedStatus = req.body.status;
            const filter = { _id: ObjectId(id) };
            // console.log(updatedStatus);
            bookingCollection
                .updateOne(filter, {
                    $set: { status: updatedStatus },
                })
                .then((result) => {
                    res.send(result);
                });
        });
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running TravelRide Server');
});

app.listen(port, () => {
    console.log('Running TravelRide Server on port', port);
});
