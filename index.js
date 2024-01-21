require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const express = require("express");
const Schema = mongoose.Schema;

const app = express();
const port = 5000;

// Connect to the database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connection successful');
    const personSchema = new Schema({
      name: {
        type: String,
        required: true
      },
      age: {
        type: Number,
        default: 18 
      },
      favoriteFoods: {
        type: [String] 
      }
    });

    const Person = mongoose.model('Person', personSchema);

    // Route to save a new person
    app.post('/people', async (req, res) => {
      const { name, age, favoriteFoods } = req.body;
      try {
        const newPerson = new Person({ name, age, favoriteFoods });
        const savedPerson = await newPerson.save();
        res.json(savedPerson);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

    // Route to retrieve all people
    app.get('/people', async (req, res) => {
      try {
        const people = await Person.find();
        res.json(people);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    });

// get perple by name
    app.get('/people/:name', async (req, res) => {
        const name = req.params.name;
        try {
          const people = await Person.find({ name: name });
          res.json(people);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      });
  

      //Find just one person which has a certain food in the person's favorites
      app.get('/people/favoriteFood/:food', async (req, res) => {
        const food = req.params.food;
        try {
          const person = await Person.findOne({ favoriteFoods: food });
          res.json(person);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      });

// find by id
      app.get('/people/:personId', async (req, res) => {
        const personId = req.params.personId;
        try {
          const person = await Person.findById(personId);
          res.json(person);
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      });

//update by name
      app.put('/updatePerson', (req, res) => {
        const personName = 'John Doe'; // Replace with the desired person's name
        Person.findOneAndUpdate(
          { name: personName },
          { age: 20 },
          { new: true } // Return the updated document
        )
        .then(updatedPerson => {
          res.json({ message: 'Person updated successfully', updatedPerson });
        })
        .catch(err => {
          res.status(500).json({ message: 'Error updating person', error: err });
        });
      });
      
// Delete all the people whose name is "Mary"
app.delete('/people/deleteMary', (req, res) =>{
Person.deleteMany({ name: "Mary" })
  .then(result => {
    res.json({ message: 'People deleted successfully', result });
  })
  .catch(err => {
    res.status(500).json({ message: 'Error deleting people', error: err });
})
  });

// Find people who like burritos, sort by name, limit to 2 documents, and hide their age
app.get('/people/find', (req, res) =>{
Person.find({ likes: 'burritos' })  // Find people who like burritos
  .sort('name')                     // Sort them by name
  .limit(2)                         // Limit the results to two documents
  .select('-age')                   // Hide their age
  .then(data => {
    res.json(data);  // Send the query results as a JSON response
  })
  .catch(err => {
    res.status(500).json({ message: 'Error finding people', error: err });
  })
  });


    // Delete the person by _id
    app.delete('/people/:id', (req, res) => {
        const personId = req.params.id; // Get the person's _id from the request parameters
        Person.findByIdAndDelete(personId)
          .then(removedPerson => {
            console.log('Person removed successfully:', removedPerson);
            res.json({ message: 'Person removed successfully', removedPerson });
          })
          .catch(err => {
            console.error('Error removing person:', err);
            res.status(500).json({ message: 'Error removing person', error: err });
          });
      });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Database connection error', err);
  });
