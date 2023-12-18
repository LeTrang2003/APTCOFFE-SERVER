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
const axios = require("axios");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const Table = require("./models/TableModel");
const Type = require("./models/TypeModel");
const Invoice = require("./models/InvoiceModel");
const { format } = require("date-fns");

mongoose
  .connect("mongodb://127.0.0.1:27017/SeverCoffee", {
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

app.get("/web/register", (req, res) => {
  const relativePath = "Screen/RegisterUser";
  res.render(relativePath);
});

app.get("/web/insert-type", async (req, res) => {
  const relativePath = "Screen/InsertType";
  res.render(relativePath);
});
app.get("/web/insert-table", (req, res) => {
  const relativePath = "Screen/InsertTable";
  res.render(relativePath);
});
app.get("/web/insert-product", async (req, res) => {
  try {
    const types = await Type.find();
    const relativePath = "Screen/InsertProduct";
    res.render(relativePath, { types });
  } catch (error) {
    console.error("Error fetching types:", error);
    res.status(500).send("Error fetching types from the database.");
  }
});

app.get("/web/list-product", (req, res) => {
  const relativePath = "Screen/List";
  res.render(relativePath);
});
app.get("/web/list-type", (req, res) => {
  const relativePath = "Screen/ListType";
  res.render(relativePath);
});
app.get("/web/list-table", (req, res) => {
  const relativePath = "Screen/ListTable";
  res.render(relativePath);
});
app.get("/web/list-user", async (req, res) => {
  try {
    const users = await User.find();
    const relativePath = "Screen/ListUser";
    res.render(relativePath, { users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users from the database.");
  }
});

///////API//////
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products from the database.");
  }
});
app.get("/api/tables", async (req, res) => {
  try {
    const table = await Table.find();
    res.json(table);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products from the database.");
  }
});

app.get("/api/types", async (req, res) => {
  try {
    const type = await Type.find();
    res.json(type);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products from the database.");
  }
});
app.get("/api/users", async (req, res) => {
  try {
    const user = await User.find();
    res.json(user);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products from the database.");
  }
});
app.get("/api/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Error fetching invoices" });
  }
});

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dynyiwsej",
  api_key: "954471537615328",
  api_secret: "BALu9M-94mXuMyIDuwafFSoxcbQ",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "your-folder-name",
    format: async (req, file) => "png",
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
});

const uploadImages = upload.array("avatar", 2);
const uploadImagess = upload.array("image", 2);

// app.post("/register/user", uploadImages, async (req, res) => {
//   try {
//     const result = await cloudinary.uploader
//       .upload_stream({ folder: "Image" }, async (error, result) => {
//         if (error) {
//           console.error("Error uploading image to Cloudinary:", error);
//           return res.status(500).json({
//             error: "An error occurred while adding the product.",
//           });
//         }

//         const { email, username, password, rank } = req.body;
//         var listAvt = [result.secure_url];
//         console.log(listAvt);

//         const user = new User({
//           email,
//           username,
//           password,
//           rank,
//           avatar: result.secure_url,
//         });
//         console.log(result.secure_url);

//         await user.save();

//         res.redirect("/list");
//       })
//       .end(req.files[0].buffer);
//   } catch (error) {
//     console.error("Error adding product:", error);
//     res.status(500).json({
//       error: "An error occurred while adding the product.",
//     });
//   }
// });

app.post("/insert/table", upload.none(), async (req, res) => {
  try {
    const { tablename, idProduct, status } = req.body;

    const table = new Table({
      name: tablename,
      idProduct,
      status,
    });

    await table.save();
    res.status(200).json({ message: "Table inserted successfully" });
  } catch (error) {
    console.error("Error inserting table:", error);
    res.status(500).json({ error: "Error inserting table" });
  }
});
/// Product
app.post("/insert/product", uploadImagess, async (req, res) => {
  try {
    const result = await cloudinary.uploader
      .upload_stream({ folder: "Image" }, async (error, result) => {
        if (error) {
          console.error("Error uploading image to Cloudinary:", error);
          return res.status(500).json({
            error: "An error occurred while adding the product.",
          });
        }

        const { idType, name, price } = req.body;

        const product = new Product({
          idType,
          name,
          price,
          image: result.secure_url,
        });

        await product.save();

        res.redirect("/list");
      })
      .end(req.files[0].buffer);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      error: "An error occurred while adding the product.",
    });
  }
});
app.put(
  "/update/product/:productId",
  upload.array("editImage", 2),
  async (req, res) => {
    try {
      const productId = req.params.productId;
      const { idType, name, price } = req.body;
      if (req.files && req.files.length > 0) {
        const result = await cloudinary.uploader
          .upload_stream({ folder: "Image" }, async (error, result) => {
            if (error) {
              console.error("Error uploading image to Cloudinary:", error);
              return res.status(500).json({
                error: "An error occurred while updating the product.",
              });
            }
            await Product.findByIdAndUpdate(productId, {
              idType,
              name,
              price,
              image: result.secure_url,
            });

            res.redirect("/list");
          })
          .end(req.files[0].buffer);
      } else {
        await Product.findByIdAndUpdate(productId, {
          idType,
          name,
          price,
        });

        res.redirect("/list");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        error: "An error occurred while updating the product.",
      });
    }
  }
);
app.delete("/delete/product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    await Product.findByIdAndDelete(productId);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      error: "An error occurred while deleting the product.",
    });
  }
});
/// User
app.post("/insert/user", uploadImages, async (req, res) => {
  try {
    const result = await cloudinary.uploader
      .upload_stream({ folder: "Image" }, async (error, result) => {
        if (error) {
          console.error("Error uploading image to Cloudinary:", error);
          return res.status(500).json({
            error: "An error occurred while adding the product.",
          });
        }

        const { email, username, password, rank } = req.body;

        const user = new User({
          email,
          username,
          password,
          rank,
          avatar: result.secure_url,
        });

        await user.save();

        res.redirect("/web/list-user");
      })
      .end(req.files[0].buffer);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      error: "An error occurred while adding the product.",
    });
  }
});
app.put(
  "/update/user/:userId",
  upload.array("editImage", 2),
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const { email, username, password, rank } = req.body;
      if (req.files && req.files.length > 0) {
        const result = await cloudinary.uploader
          .upload_stream({ folder: "Image" }, async (error, result) => {
            if (error) {
              console.error("Error uploading image to Cloudinary:", error);
              return res.status(500).json({
                error: "An error occurred while updating the product.",
              });
            }
            await User.findByIdAndUpdate(userId, {
              email,
              username,
              password,
              rank,
              avatar: result.secure_url,
            });

            res.redirect("/web/list-user");
          })
          .end(req.files[0].buffer);
      } else {
        await User.findByIdAndUpdate(userId, {
          email,
          username,
          password,
          rank,
        });

        res.redirect("/list");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        error: "An error occurred while updating the product.",
      });
    }
  }
);
app.delete("/delete/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    await User.findByIdAndDelete(userId);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      error: "An error occurred while deleting the product.",
    });
  }
});
// Type
app.post("/insert/type", uploadImagess, async (req, res) => {
  try {
    const result = await cloudinary.uploader
      .upload_stream({ folder: "Image" }, async (error, result) => {
        if (error) {
          console.error("Error uploading image to Cloudinary:", error);
          return res.status(500).json({
            error: "An error occurred while adding the product.",
          });
        }

        const { name } = req.body;

        const type = new Type({
          name,
          image: result.secure_url,
        });

        await type.save();

        res.redirect("/web/list-user");
      })
      .end(req.files[0].buffer);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      error: "An error occurred while adding the product.",
    });
  }
});
app.put(
  "/update/type/:typeId",
  upload.array("editImage", 2),
  async (req, res) => {
    try {
      const typeId = req.params.typeId;
      const { name } = req.body;
      if (req.files && req.files.length > 0) {
        const result = await cloudinary.uploader
          .upload_stream({ folder: "Image" }, async (error, result) => {
            if (error) {
              console.error("Error uploading image to Cloudinary:", error);
              return res.status(500).json({
                error: "An error occurred while updating the product.",
              });
            }
            await Type.findByIdAndUpdate(typeId, {
              name,
              image: result.secure_url,
            });

            res.redirect("/web/list-type");
          })
          .end(req.files[0].buffer);
      } else {
        await User.findByIdAndUpdate(typeId, {
          name,
        });

        res.redirect("/web/list-type");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({
        error: "An error occurred while updating the product.",
      });
    }
  }
);
app.delete("/delete/type/:typeId", async (req, res) => {
  try {
    const typeId = req.params.typeId;
    await Type.findByIdAndDelete(typeId);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      error: "An error occurred while deleting the product.",
    });
  }
});
//// Table

app.post("/insert/table", upload.none(), async (req, res) => {
  try {
    const { tablename, idProduct, status } = req.body;

    const table = new Table({
      name: tablename,
      idProduct,
      status,
    });

    await table.save();
    res.status(200).json({ message: "Table inserted successfully" });
  } catch (error) {
    console.error("Error inserting table:", error);
    res.status(500).json({ error: "Error inserting table" });
  }
});
app.put(
  "/update/table/:tableId",
  upload.single("editImage"),
  async (req, res) => {
    const tableId = req.params.tableId;
    const { name, idProduct, status } = req.body;

    try {
      const updatedTable = await Table.findByIdAndUpdate(
        tableId,
        { name, idProduct, status },
        { new: true }
      );

      if (!updatedTable) {
        return res.status(404).json({ message: "Product not found" });
      }

      console.log(updatedTable);
      res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: "Error updating product" });
    }
  }
);
app.delete("/delete/table/:tableId", async (req, res) => {
  try {
    const tableId = req.params.tableId;
    await Table.findByIdAndDelete(tableId);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      error: "An error occurred while deleting the product.",
    });
  }
});
//// Invoice
app.post("/insert/invoice", async (req, res) => {
  try {
    const { idTable, idProduct, timeIn, timeOut, price, note, dateInvoice } =
      req.body;

    const invoice = new Invoice({
      idTable,
      idProduct,
      timeIn,
      timeOut,
      price,
      note,
      dateInvoice,
    });

    await invoice.save();
    res.status(200).json({ message: "Invoice inserted successfully" });
  } catch (error) {
    console.error("Error inserting invoice:", error);
    res.status(500).json({ error: "Error inserting invoice" });
  }
});

app.put("/update/invoice/:invoiceId", async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const { idTable, idProduct, timeIn, timeOut, price, note, dateInvoice } =
      req.body;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { idTable, idProduct, timeIn, timeOut, price, note, dateInvoice },
      { new: true }
    );

    if (!updatedInvoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    console.log(updatedInvoice);
    res.status(200).json({ message: "Invoice updated successfully" });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).json({ error: "Error updating invoice" });
  }
});

app.delete("/delete/invoice/:invoiceId", async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    await Invoice.findByIdAndDelete(invoiceId);

    res.status(200).json({ message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({ error: "Error deleting invoice" });
  }
});

/////  Statistical
/// d-m-y
app.get("/statistics/byday/:date", async (req, res) => {
  try {
    const date = req.params.date;
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    endDate.setHours(23, 59, 59, 999);

    console.log("StartDate:", startDate);
    console.log("EndDate:", endDate);

    const invoices = await Invoice.find({
      dateInvoice: { $gte: startDate, $lte: endDate },
    });

    console.log("Invoices:", invoices);

    const totalRevenue = invoices.reduce(
      (total, invoice) => total + invoice.price,
      0
    );

    res.status(200).json({
      date,
      totalRevenue,
      numberOfInvoices: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching daily statistics:", error);
    res.status(500).json({ error: "Error fetching daily statistics" });
  }
});
//// m-y
app.get("/statistics/bymonth/:month/:year", async (req, res) => {
  try {
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const invoices = await Invoice.find({
      dateInvoice: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
    });

    const totalRevenue = invoices.reduce(
      (total, invoice) => total + invoice.price,
      0
    );

    res.status(200).json({
      month,
      year,
      totalRevenue,
      numberOfInvoices: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching monthly statistics:", error);
    res.status(500).json({ error: "Error fetching monthly statistics" });
  }
});
/// y
app.get("/statistics/byyear/:year", async (req, res) => {
  try {
    const year = parseInt(req.params.year);

    const firstDayOfYear = new Date(year, 0, 1);
    const lastDayOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const invoices = await Invoice.find({
      dateInvoice: { $gte: firstDayOfYear, $lte: lastDayOfYear },
    });

    const totalRevenue = invoices.reduce(
      (total, invoice) => total + invoice.price,
      0
    );

    res.status(200).json({
      year,
      totalRevenue,
      numberOfInvoices: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching yearly statistics:", error);
    res.status(500).json({ error: "Error fetching yearly statistics" });
  }
});

////////

app.listen(port, () => {
  console.log(`Server running at the port ${port}`);
});
