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
const auth_1 = require("../middleware/auth");
const db_1 = __importStar(require("../config/db"));
const router = express_1.default.Router();
router.get("/tasks", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const pool = yield (0, db_1.connectDB)();
        const result = yield pool
            .request()
            .input("Email", db_1.default.NVarChar, user.email)
            .query(`
        SELECT 
          te.TaskExecutionID AS id, 
          s.Name AS title, 
          co.Description AS description, 
          te.OrderID AS orderId,
          st.Name AS status, 
          e.FullName AS assignee, 
          te.ExecutionDate AS createdAt
        FROM TaskExecution te
        JOIN Employee e ON te.EmployeeID = e.EmployeeID
        JOIN CustomerOrder co ON te.OrderID = co.OrderID
        JOIN Stage s ON te.StageID = s.StageID
        JOIN TaskType tt ON s.TaskTypeID = tt.TaskTypeID
        JOIN Status st ON te.StatusID = st.StatusID
        WHERE e.Email = @Email
      `);
        res.send(result.recordset);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
}));
router.get("/tasks/:id", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskId = req.params.id;
    try {
        const pool = yield (0, db_1.connectDB)();
        const result = yield pool
            .request()
            .input("TaskExecutionID", db_1.default.Int, taskId)
            .query(`
        SELECT 
          te.TaskExecutionID AS id, 
          s.Name AS title, 
          co.Description AS description, 
          te.OrderID AS orderId,
          st.Name AS status, 
          e.FullName AS assignee, 
          te.ExecutionDate AS createdAt
        FROM TaskExecution te
        JOIN Employee e ON te.EmployeeID = e.EmployeeID
        JOIN CustomerOrder co ON te.OrderID = co.OrderID
        JOIN Stage s ON te.StageID = s.StageID
        JOIN TaskType tt ON s.TaskTypeID = tt.TaskTypeID
        JOIN Status st ON te.StatusID = st.StatusID
        WHERE te.TaskExecutionID = @TaskExecutionID
      `);
        if (result.recordset.length === 0) {
            res.status(404).send({ message: "Task not found" });
            return;
        }
        res.send(result.recordset[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
}));
router.put("/tasks/:id", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskId = req.params.id;
    const { description } = req.body;
    try {
        const pool = yield (0, db_1.connectDB)();
        yield pool
            .request()
            .input("TaskExecutionID", db_1.default.Int, taskId)
            .input("Description", db_1.default.NVarChar, description)
            .query(`
        UPDATE TaskExecution te
        JOIN CustomerOrder co ON te.OrderID = co.OrderID
        SET co.Description = @Description
        WHERE te.TaskExecutionID = @TaskExecutionID
      `);
        const updatedTask = yield pool
            .request()
            .input("TaskExecutionID", db_1.default.Int, taskId)
            .query(`
        SELECT 
          te.TaskExecutionID AS id, 
          s.Name AS title, 
          co.Description AS description, 
          te.OrderID AS orderId,
          st.Name AS status, 
          e.FullName AS assignee, 
          te.ExecutionDate AS createdAt
        FROM TaskExecution te
        JOIN Employee e ON te.EmployeeID = e.EmployeeID
        JOIN CustomerOrder co ON te.OrderID = co.OrderID
        JOIN Stage s ON te.StageID = s.StageID
        JOIN TaskType tt ON s.TaskTypeID = tt.TaskTypeID
        JOIN Status st ON te.StatusID = st.StatusID
        WHERE te.TaskExecutionID = @TaskExecutionID
      `);
        res.send(updatedTask.recordset[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
}));
router.put("/tasks/:id/complete", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskId = req.params.id;
    try {
        const pool = yield (0, db_1.connectDB)();
        yield pool
            .request()
            .input("TaskExecutionID", db_1.default.Int, taskId)
            .input("StatusID", db_1.default.Int, 3)
            .query("UPDATE TaskExecution SET StatusID = @StatusID WHERE TaskExecutionID = @TaskExecutionID");
        res.send({ message: "Task completed" });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
}));
router.post("/tasks", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, employeeEmail } = req.body;
    try {
        const pool = yield (0, db_1.connectDB)();
        const employeeResult = yield pool
            .request()
            .input("Email", db_1.default.NVarChar, employeeEmail)
            .query("SELECT EmployeeID FROM Employee WHERE Email = @Email");
        if (employeeResult.recordset.length === 0) {
            res.status(404).send({ message: "Employee not found" });
            return;
        }
        const employeeId = employeeResult.recordset[0].EmployeeID;
        const stageResult = yield pool
            .request()
            .input("Name", db_1.default.NVarChar, title)
            .input("TaskTypeID", db_1.default.Int, 1)
            .query("INSERT INTO Stage (Name, TaskTypeID) OUTPUT INSERTED.StageID VALUES (@Name, @TaskTypeID)");
        const stageId = stageResult.recordset[0].StageID;
        yield pool
            .request()
            .input("OrderID", db_1.default.Int, 1)
            .input("EmployeeID", db_1.default.Int, employeeId)
            .input("StageID", db_1.default.Int, stageId)
            .input("ExecutionDate", db_1.default.Date, new Date())
            .input("HoursSpent", db_1.default.Int, 0)
            .input("StatusID", db_1.default.Int, 1)
            .query(`
        INSERT INTO TaskExecution (OrderID, EmployeeID, StageID, ExecutionDate, HoursSpent, StatusID)
        VALUES (@OrderID, @EmployeeID, @StageID, @ExecutionDate, @HoursSpent, @StatusID)
      `);
        res.status(201).send({ message: "Task created" });
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
}));
router.post("/tasks/:id/comments", auth_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const taskId = req.params.id;
    const { text } = req.body;
    const user = req.user;
    try {
        const pool = yield (0, db_1.connectDB)();
        const commentResult = yield pool
            .request()
            .input("TaskExecutionID", db_1.default.Int, taskId)
            .input("Text", db_1.default.NVarChar, text)
            .input("Author", db_1.default.NVarChar, user.email)
            .input("CreatedAt", db_1.default.DateTime, new Date())
            .query(`
        INSERT INTO Comment (TaskExecutionID, Text, Author, CreatedAt)
        OUTPUT INSERTED.*
        VALUES (@TaskExecutionID, @Text, @Author, @CreatedAt)
      `);
        res.status(201).send(commentResult.recordset[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Server error" });
    }
}));
exports.default = router;
