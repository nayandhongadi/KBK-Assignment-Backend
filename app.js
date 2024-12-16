const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const connectDB = require('./db/db');
const User = require('./model/userSchema');
const Product = require('./model/productSchema');
const Stripe = require("stripe");



const stripe = new Stripe('My secrete key...');


const app = express();

connectDB();

app.use(express.json());
app.use(cors());

const PORT = 8000;

app.get('/welcome', (req, res) => {
    console.log("Welcome endpoint hit");
    res.send("Welcome to the API");
});

// POST /signup API
app.post('/signup', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("Received data:", email, password);

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", userId: newUser._id });
    } catch (error) {
        console.error("Error saving user:", error);


        res.status(500).json({ message: "Internal server error" });
    }
});


// POST /login API

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.status(200).json({ message: "Login successful" });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



// Get /fetch all products API
app.get("/get-all-products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products" });
    }
});



// Post /  Add a new product
app.post("/add-product", async (req, res) => {
    try {
        const { name, price, description } = req.body;

        const newProduct = new Product({
            name,
            price,
            description,
        });

        await newProduct.save();
        res.status(201).json();
    } catch (error) {
        res.status(500).json({ message: "Error adding product" });
    }
});



// Put / Edit an existing product
app.put("/edit-product/:id", async (req, res) => {
    try {
        const { name, price, description } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price, description },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Error updating product" });
    }
});




// delete / Delete a product
app.delete("/delete-product/:id", async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product" });
    }
});









// Create PaymentIntent API




// app.post("/create-payment-intent", async (req, res) => {
//     console.log("API hit...");
//     const { amount, currency } = req.body;

//     try {
//         if (!Number.isInteger(amount)) {
//             throw new Error("Amount must be an integer in the smallest currency unit.");
//         }
//         if (!["usd", "inr"].includes(currency)) {
//             throw new Error("Unsupported currency.");
//         }

//         const paymentIntent = await stripe.paymentIntents.create({
//             amount,
//             currency,
//         });

//         console.log("PaymentIntent created successfully.");
//         res.json(paymentIntent.client_secret); // Return the client_secret
//     } catch (error) {
//         console.error("Error creating PaymentIntent:", error);
//         res.status(500).json({ error: error.message });
//     }
// });


app.post("/create-payment-intent", async (req, res) => {
    const { amount, currency } = req.body;
  
    try {
      if (!Number.isInteger(amount)) {
        throw new Error("Amount must be an integer in the smallest currency unit.");
      }
      if (!["usd", "inr"].includes(currency)) {
        throw new Error("Unsupported currency.");
      }
  
      // Create a PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
      });
  
      // Return the client_secret directly
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating PaymentIntent:", error);
      res.status(500).json({ error: error.message });
    }
  });
  







app.listen(PORT, () => {
    console.log("App is running on the port", PORT);
});
