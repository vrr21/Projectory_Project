"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const statusController_1 = require("../controllers/statusController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', (0, auth_1.authMiddleware)(), statusController_1.getStatuses);
exports.default = router;
