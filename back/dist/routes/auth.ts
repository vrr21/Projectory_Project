import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql, { connectDB } from "../dist/config/db";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, fullName, phone } = req.body;

  try {
    const pool = await connectDB();
    const employeeResult = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM Employee WHERE Email = @Email");

    if (employeeResult.recordset.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const employeeInsert = await pool
      .request()
      .input("FullName", sql.NVarChar, fullName)
      .input("Email", sql.NVarChar, email)
      .input("Phone", sql.NVarChar, phone)
      .input("PositionID", sql.Int, 1) // По умолчанию разработчик
      .query(
        "INSERT INTO Employee (FullName, Email, Phone, PositionID) OUTPUT INSERTED.EmployeeID VALUES (@FullName, @Email, @Phone, @PositionID)"
      );

    const employeeId = employeeInsert.recordset[0].EmployeeID;
    await pool
      .request()
      .input("EmployeeID", sql.Int, employeeId)
      .input("Email", sql.NVarChar, email)
      .input("Password", sql.NVarChar, hashedPassword)
      .input("Role", sql.NVarChar, "Сотрудник")
      .query(
        "INSERT INTO Users (EmployeeID, Email, Password, IsAdmin, Role) VALUES (@EmployeeID, @Email, @Password, 0, @Role)"
      );

    const token = jwt.sign({ email, role: "Сотрудник" }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM Users WHERE Email = @Email");

    if (result.recordset.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ email: user.Email, role: user.Role, isAdmin: user.IsAdmin }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;