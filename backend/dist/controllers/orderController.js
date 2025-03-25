"use strict";
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
exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrders = void 0;
const db_1 = __importDefault(require("../config/db"));
const getOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield db_1.default;
        const result = yield pool.request().query('SELECT * FROM CustomerOrder');
        res.json(result.recordset);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.getOrders = getOrders;
const createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerId, orderTypeId, orderDate, description, statusId } = req.body;
    try {
        const pool = yield db_1.default;
        yield pool.request()
            .input('customerId', customerId)
            .input('orderTypeId', orderTypeId)
            .input('orderDate', orderDate)
            .input('description', description)
            .input('statusId', statusId)
            .query('INSERT INTO CustomerOrder (CustomerID, OrderTypeID, OrderDate, Description, StatusID) VALUES (@customerId, @orderTypeId, @orderDate, @description, @statusId)');
        res.status(201).json({ message: 'Order created' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.createOrder = createOrder;
const updateOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { customerId, orderTypeId, orderDate, description, statusId } = req.body;
    try {
        const pool = yield db_1.default;
        yield pool.request()
            .input('id', id)
            .input('customerId', customerId)
            .input('orderTypeId', orderTypeId)
            .input('orderDate', orderDate)
            .input('description', description)
            .input('statusId', statusId)
            .query('UPDATE CustomerOrder SET CustomerID = @customerId, OrderTypeID = @orderTypeId, OrderDate = @orderDate, Description = @description, StatusID = @statusId WHERE OrderID = @id');
        res.json({ message: 'Order updated' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.updateOrder = updateOrder;
const deleteOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const pool = yield db_1.default;
        yield pool.request()
            .input('id', id)
            .query('DELETE FROM CustomerOrder WHERE OrderID = @id');
        res.json({ message: 'Order deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});
exports.deleteOrder = deleteOrder;
