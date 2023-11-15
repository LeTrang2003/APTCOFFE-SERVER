const { render } = require("ejs");
const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.set("view engine", "ejs");
const User = require("./models/UserModel");
const mongoose = require("mongoose");
const path = require("path");
const Product = require("./models/ProductModel");

app.use(express.static("public"));
app.use(
  "/Image",
  express.static("/Users/khanhnq/Documents/Fpoly/Server/Assignment/Image")
);
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Image/");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadImage = multer({
  storage: storage,
});

mongoose
  .connect("mongodb://127.0.0.1:27017/Product", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Kết nối tới MongoDB thành công.");
  })
  .catch((err) => {
    console.error("Lỗi khi kết nối tới MongoDB: " + err);
  });

app.get("/home", (req, res) => {
  const relativePath = "Screen/Home";
  res.render(relativePath);
});
app.get("/login", (req, res) => {
  const relativePath = "Screen/Login";
  res.render(relativePath);
});
app.get("/register", (req, res) => {
  const relativePath = "Screen/Register";
  res.render(relativePath);
});

app.get("/list", (req, res) => {
  const relativePath = "Screen/List";
  res.render(relativePath);
});
app.get("/listuser", (req, res) => {
  const relativePath = "Screen/ListUser";
  res.render(relativePath);
});
app.get("/insert", (req, res) => {
  const relativePath = "Screen/Insert";
  res.render(relativePath);
});
app.post("/register/user", async (req, res) => {
  console.log(req.body);
  const newUser = new User({
    email: req.body.email,
    password: req.body.password,
  });
  try {
    const result = await newUser.save();
    res.json(result);
  } catch (error) {
    console.log(error);
  }
});
app.post("/insert/product", uploadImage.single("avatar"), async (req, res) => {
  const namecheck = req.body.name;

  try {
    const existingProduct = await Product.findOne({ name: namecheck });
    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const { name, price, company } = req.body;
    const imagePath = req.file.filename;

    const newProduct = new Product({
      name,
      price,
      company,
      avatar: imagePath,
    });

    const result = await newProduct.save();

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// app.post("/insert/product", async (req, res) => {
//   console.log(req.body);
//   const { name, price, company, avatar } = req.body;
//   const newProduct = new Product({
//     name,
//     price,
//     company,
//     avatar,
//   });

//   try {
//     const result = await newProduct.save();
//     res.json(result);
//   } catch (error) {
//     console.log(error);
//   }
// });
app.get("/insert/product", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products from the database.");
  }
});
app.get("/register/user", async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products from the database.");
  }
});

app.put(
  "/insert/product/:productId",
  uploadImage.single("editImage"),
  async (req, res) => {
    const productId = req.params.productId;
    const { name, price, company } = req.body;

    // if (!name || !price || !company || !avatar) {
    //   return res.status(400).json({ error: "Missing required fields" });
    // }

    try {
      const avatar = req.file.filename;
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { name, price, company, avatar },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      console.log(updatedProduct);
      res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Error updating product" });
    }
  }
);

app.delete("/insert/product/:productId", async (req, res) => {
  const productId = req.params.productId;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(deletedProduct);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Error deleting product" });
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email: email, password: password });

  if (user) {
    res.send("Đăng nhập thành công");
  } else {
    res.status(400).json({ message: "Wrong account or password" });
  }
});

app.listen(port, () => {
  console.log(`server running at the port ${port}`);
});
