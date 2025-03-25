"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stageController_1 = require("../controllers/stageController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', (0, auth_1.authMiddleware)(), stageController_1.getStages);
exports.default = router;
