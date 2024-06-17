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
//endpoint to signup, signin , add question,add answer, update question, update answer, delete question and answer alltogether,delete answer specifiaclly,update about &tags,upvote and downvote,time integration,token verifiaction
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const jwtSecret = "sr1435";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const signupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().min(3)
});
const signinSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const postSchema = zod_1.z.object({
    title: zod_1.z.string().min(3),
    description: zod_1.z.string().min(10),
    tags: zod_1.z.string()
});
app.post("/auth/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    var check = signupSchema.safeParse(body);
    if (!check.success) {
        res.status(202).send("Wrong format of the email or password");
    }
    var user = yield prisma.user.findFirst({
        where: { email: body.email }
    });
    if (user != null) {
        res.status(202).send("User already exists, signin");
    }
    var hashedPassword = yield bcryptjs_1.default.hash(body.password, 10);
    var data = yield prisma.user.create({
        data: {
            name: body.name,
            email: body.email,
            password: hashedPassword
        }
    });
    var token = jsonwebtoken_1.default.sign({ email: body.email }, jwtSecret);
    res.status(200).send(token);
}));
app.post("/auth/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var body = req.body;
    var check = signinSchema.safeParse(body);
    if (!check.success) {
        res.status(202).send("Wrong format of the email or password");
    }
    var user = yield prisma.user.findFirst({
        where: { email: body.email }
    });
    if (user == null) {
        res.status(202).send("User doesnt exists, signup");
    }
    else if (user != null) {
        var check1 = yield bcryptjs_1.default.compare(body.password, user.password);
        if (!check1) {
            res.status(202).send("Wrong password");
        }
        var token = jsonwebtoken_1.default.sign({ email: body.email }, jwtSecret);
        res.status(200).send(token);
    }
}));
app.use("/api/*", (req, res, next) => {
    var token = String(req.headers.auth);
    var check = jsonwebtoken_1.default.verify(token, jwtSecret, (err) => {
        if (err) {
            res.status(202).send("Invalid token");
        }
        next();
    });
});
app.post("/api/question", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var token = String(req.headers.auth);
    var body = req.body;
    var verify = jsonwebtoken_1.default.decode(token);
    if (verify !== null && typeof verify === "object") {
        var data = yield prisma.user.findFirst({
            where: { email: verify.email }
        });
        if (data != null) {
            var question = yield prisma.question.create({
                data: {
                    user_id: data.id,
                    title: body.title,
                    description: body.description,
                }
            });
            res.status(200).send("question creation success");
        }
    }
}));
app.post("/api/answer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var token = String(req.headers.auth);
    var body = req.body;
    var verify = jsonwebtoken_1.default.decode(token);
    if (verify !== null && typeof verify === "object") {
        var data = yield prisma.user.findFirst({
            where: { email: verify.email }
        });
        if (data != null) {
            var question = yield prisma.answer.create({
                data: {
                    user_id: data.id,
                    name: data.name,
                    question_id: body.id,
                    answer: body.answer,
                }
            });
            res.status(200).send("answer creation success");
        }
    }
}));
app.get("/send/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var data = yield prisma.question.findMany({
        select: {
            id: true,
            user_id: true,
            title: true,
            description: true,
            answer: true,
            upvote: true,
            downvote: true,
            tags: true,
            time: true,
            user: true,
        }
    });
    res.status(200).json(data);
}));
app.post("/api/question", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
}));
app.listen(3000);
