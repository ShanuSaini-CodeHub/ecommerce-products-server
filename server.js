const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const fs = require("fs");
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "webappdb",
});

db.connect((err) => {
  if (err) {
    console.log("Error connecting to Db");
    return;
  }
  console.log("Connection established");
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const sql = "INSERT INTO login (`name`, `email`, `password`) VALUES (?)";
    const values = [name, email, hashedPassword];
    db.query(sql, [values], (err, data) => {
      if (err) {
        res.status(500).json({ status: 500, message: "Internal server error" });
      }
      if (data) {
        res.status(200).json({ status: 200, message: "User created successfully" });
      } else {
        res.status(404).json({ status: 404, message: "User not created" });
      }
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
  // Mocked file
  // try {
  //   let file = fs.readFileSync(
  //     './mocks/signup/SignupSuccess.json',
  //     'utf8',
  //   );
  //   res.status(200).send(file);
  // } catch (e) {
  //   console.log(e);
  //   res.status(500).send(req.path + ' not found');
  // }
});

app.post("/login", async (req, res) => {
  const { email, loginPassword } = req.body;
  try {
    const sql = "SELECT * FROM login WHERE `email` = ?";
    db.query(sql, [email], async (err, data) => {
      if (err) {
        res.status(500).json({ status: 500, message: "Internal server error" });
      }
      if (data[0]) {
        const passwordMatch = await bcrypt.compare(
          loginPassword,
          data[0]?.password
        );
        if (passwordMatch) {
          res.status(200).json({
            status: 200,
            message: "Authentication successful",
            data: {
              name: data[0].name,
              email: data[0].email,
            },
          });
        } else {
          res
            .status(401)
            .json({ status: 401, message: "Authentication failed. Incorrect password." });
        }
      } else {
        res.status(404).json({ status: 404, message: "User not found" });
      }
    });
  } catch (error) {
    console.error("Error during authentication:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
  // Mocked file
  // try {
  //   let file = fs.readFileSync(
  //     './mocks/login/LoginSuccess.json',
  //     'utf8',
  //   );
  //   res.status(200).send(file);
  // } catch (e) {
  //   console.log(e);
  //   res.status(500).send(req.path + ' not found');
  // }
});

app.post("/products-list", (req, res) => {
  try {
    const sql = "SELECT * FROM products WHERE `type` = ?";
    db.query(sql, [req.body.productType], (err, data) => {
      if (err) {
        res.status(500).json({ status: 500, message: "Internal server error" });
      }
      if (data?.length > 0) {
        res
          .status(200)
          .json({ status: 200, message: "Fetched products list successfully", data: data });
      } else {
        res.status(404).json({ status: 404, message: "No data found" });
      }
    });
  } catch (error) {
    console.error("Error during fetching products-list:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
  // Mocked file
  // try {
  //   let file = fs.readFileSync(
  //     './mocks/products-list/+ req.body.productType +'.json',
  //     'utf8',
  //   );
  //   res.status(200).send(file);
  // } catch (e) {
  //   console.log(e);
  //   res.status(500).send(req.path + ' not found');
  // }
});

app.post("/product-suggestions", (req, res) => {
  const { code, price, productType, manufacture } = req.body;
  try {
    const sql =
      "SELECT * FROM products WHERE `code` <> ? AND ((`price` BETWEEN ? AND ?) OR (`type` = ? OR `manufacture` = ?)) LIMIT 3";
    db.query(
      sql,
      [code, price - price / 2, price + price / 2, productType, manufacture],
      (err, data) => {
        if (err) {
          res.status(500).json({ status: 500, message: "Internal server error" });
        }
        if (data?.length > 0) {
          res.status(200).json({
            status: 200,
            message: "Fetched products suggestions successfully",
            data: data,
          });
        } else {
          res.status(404).json({ status: 404, message: "No data found" });
        }
      }
    );
  } catch (error) {
    console.error("Error during fetching products-suggestions:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
  // Mocked file
  // try {
  //   let file = fs.readFileSync(
  //     './mocks/product-suggestions/SuggestionsSuccess.json',
  //     'utf8',
  //   );
  //   res.status(200).send(file);
  // } catch (e) {
  //   console.log(e);
  //   res.status(500).send(req.path + ' not found');
  // }
});

app.post("/search-results", (req, res) => {
  try {
    const sql =
      "SELECT * FROM products WHERE CONCAT(`name`, `description`, `type`, `manufacture`) LIKE ? LIMIT 6";
    db.query(sql, ["%" + req.body.searchInput + "%"], (err, data) => {
      if (err) {
        res.status(500).json({ status: 500, message: "Internal server error" });
      }
      if (data?.length > 0) {
        res.status(200).json({
          status: 200,
          message: "Fetched search results successfully",
          data: data,
        });
      } else {
        res.status(404).json({ status: 404, message: "No data found" });
      }
    });
  } catch (error) {
    console.error("Error during fetching search results:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
  // Mocked file
  // try {
  //   let file = fs.readFileSync(
  //     './mocks/search-results/ResultsSuccess.json',
  //     'utf8',
  //   );
  //   res.status(200).send(file);
  // } catch (e) {
  //   console.log(e);
  //   res.status(500).send(req.path + ' not found');
  // }
});

app.listen(port, () => {
  console.log(`Server is running on port.` + port);
});
