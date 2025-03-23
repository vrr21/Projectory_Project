"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importStar(require("../config/db"));
const router = express_1.default.Router();
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, fullName, phone } = req.body;
    try {
        const pool = yield (0, db_1.connectDB)();
        const employeeResult = yield pool
            .request()
            .input("Email", db_1.default.NVarChar, email)
            .query("SELECT * FROM Employee WHERE Email = @Email");
        if (employeeResult.recordset.length > 0) {
            res.status(400).send({ message: "Email already exists" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const employeeInsert = yield pool
            .request()
            .input("FullName", db_1.default.NVarChar, fullName)
            .input("Email", db_1.default.NVarChar, email)
            .input("Phone", db_1.default.NVarChar, phone)
            .input("PositionID", db_1.default.Int, 1)
            .query("INSERT INTO Employee (FullName, Email, Phone, PositionID) OUTPUT INSERTED.EmployeeID VALUES (@FullName, @Email, @Phone, @PositionID)");
        const employeeId = employeeInsert.recordset[0].EmployeeID;
        yield pool
            .request()
            .input("EmployeeID", db_1.default.Int, employeeId)
            .input("Email", db_1.default.NVarChar, email)
            .input("Password", db_1.default.NVarChar, hashedPassword)
            .input("Role", db_1.default.NVarChar, "Сотрудник")
            .query("INSERT INTO Users (EmployeeID, Email, Password, IsAdmin, Role) VALUES (@EmployeeID, @Email, @Password, 0, @Role)");
        const token = jsonwebtoken_1.default.sign({ email, role: "Сотрудник" }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(201).send({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const pool = yield (0, db_1.connectDB)();
        const result = yield pool
            .request()
            .input("Email", db_1.default.NVarChar, email)
            .query("SELECT * FROM Users WHERE Email = @Email");
        if (result.recordset.length === 0) {
            res.status(400).send({ message: "Invalid credentials" });
            return;
        }
        const user = result.recordset[0];
        const isMatch = yield bcryptjs_1.default.compare(password, user.Password);
        if (!isMatch) {
            res.status(400).send({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ email: user.Email, role: user.Role, isAdmin: user.IsAdmin }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        res.send({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
}));
exports.default = router;
