//endpoint to signup, signin , add question,add answer, update question, update answer, delete question and answer alltogether,delete answer specifiaclly,update about &tags,upvote and downvote,time integration,token verifiaction
import express, { Request, Response } from 'express';
import { z } from 'zod';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
const currentDate=new Date()
const prisma = new PrismaClient();
const app = express();
const jwtSecret = "sr1435";

app.use(cors());
app.use(express.json());

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1)
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const postSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  tags: z.string()
});

app.post("/auth/signup", async (req: Request, res: Response) => {
  var body = req.body;
  var check = signupSchema.safeParse(body);
  if (!check.success) {
     return res.status(202).send("Wrong format of the email or password");
  }
  var user = await prisma.user.findFirst({
    where: { email: body.email }
  });
  if (user != null) {
    return res.status(202).send("User already exists, signin");
  }

  var hashedPassword = await bcrypt.hash(body.password, 10);
  var data = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      time:((currentDate.getTime())/100)
    }
  });
  if(data!=null){
    var token = jwt.sign({ name: body.name }, jwtSecret);
    return res.status(200).send(token+'+'+data.name[0].toUpperCase());
  }
  
});

app.post("/auth/signin", async (req: Request, res: Response) => {
  var body = req.body;
  var check = signinSchema.safeParse(body);
  if (!check.success) {
    return res.status(202).send("Wrong format of the email or password");
  }
  var user = await prisma.user.findFirst({
    where: { email: body.email }
  });
  if (user == null) {
    return res.status(202).send("User doesnt exists, signup");
  } else if (user != null) {
    var check1 = await bcrypt.compare(body.password, user.password);
    if (!check1) {
      return res.status(202).send("Wrong password");
    }
    var token = jwt.sign({ name: user.name }, jwtSecret);
    return res.status(200).send(token+'+'+user.name[0].toUpperCase());
  }
});

app.use("/api/*", (req: Request, res: Response, next) => {
  var token = String(req.headers.auth);
  var check = jwt.verify(token, jwtSecret, (err) => {
    if (err) {
      return res.status(202).send("Invalid token");
    }
    next();
  });
});

app.post("/api/question", async (req: Request, res: Response) => {
  var token = String(req.headers.auth);
  var body = req.body;
  var verify = jwt.decode(token);
  if (verify !== null && typeof verify === "object") {
    var data = await prisma.user.findFirst({
      where: { name: verify.name }
    });
    if (data != null) {
      var question = await prisma.question.create({
        data: {
          user_id: data.id,
          name: data.name,
          title: body.title,
          description: body.description,
          tags: body.tags,
          time:((currentDate.getTime())/100)
        }
      });
      return res.status(200).send("question creation success");
    }
  }
});

app.post("/api/answer", async (req: Request, res: Response) => {
  var token = String(req.headers.auth);
  var body = req.body;
  var verify = jwt.decode(token);
  if (verify !== null && typeof verify === "object") {
    var data = await prisma.user.findFirst({
      where: { name: verify.name }
    });
    if (data != null) {
      var question = await prisma.answer.create({
        data: {
          user_id: data.id,
          name: data.name,
          question_id: body.id,
          answer: body.answer,
          time:((currentDate.getTime())/100)
        }
      });
      var send=await prisma.question.findFirst({
        where: { id: body.id },
        select:{ id: true,
          user_id: true,
          title: true,
          name:true,
          description: true,
          answer: true,
          upvote: true,
          downvote: true,
          tags: true,
          time: true,}
      })
      return res.status(200).json(send);
    }
  }
});

app.get("/send/all", async (req: Request, res: Response) => {
  var data = await prisma.question.findMany({
    select: {
      id: true,
      user_id: true,
      title: true,
      name:true,
      description: true,
      answer: true,
      upvote: true,
      downvote: true,
      tags: true,
      time: true,
    }
  });
  return res.status(200).json(data);
});
app.get("/send/:id", async (req: Request, res: Response) => {
  var id =Number(req.params.id)
  var data = await prisma.question.findFirst({
    where: { id },
    select: {
      id: true,
      user_id: true,
      title: true,
      name:true,
      description: true,
      answer: true,
      upvote: true,
      downvote: true,
      tags: true,
      time: true,
    }
  });
  return res.status(200).json(data);
});

app.put("/api/question", async (req: Request, res: Response) => {
  var question_id=Number(req.headers.question_id);
  var data = req.body;//just the question in fromat of title and description
  var question = await prisma.question.update({
    where:{id:question_id},
    data:{
      title:data.title,
      description:data.description
    }
  })
  return res.status(200).send("question updated successfully");
});
app.put("/api/answer", async (req: Request, res: Response) => {
  var answer_id=Number(req.headers.answer_id);
  var data = req.body;//just the answer 
  var answer = await prisma.answer.update({
    where:{id:answer_id},
    data:{
      answer:data.answer
    }
  })
  return res.status(200).send("question updated successfully");
});
app.get("/api/delete/answer", async (req: Request, res: Response) => {
  var answer_id=Number(req.headers.answer_id);
  var answer = await prisma.answer.delete({
    where:{id:answer_id}
  })
  return res.status(200).send("answer deleted successfully");
});
app.get("/api/delete/question", async (req: Request, res: Response) => {
  var question_id=Number(req.headers.question_id);
  var answer = await prisma.answer.deleteMany({
    where:{question_id}
  })
  var question = await prisma.question.delete({
    where:{id:question_id}
  })
 
  return res.status(200).json(answer);
});
//token verifaiction useEffect----->run on click of signin
app.get("/verify",async(req:Request,res:Response)=>{
  const token=String(req.headers.auth)
  var  check = jwt.verify(token,jwtSecret,(err:any)=>{
    if(err){
      return res.status(202).send("Invalid token");
    }
  })
  var user= jwt.decode(token)
  if(user!=null&& typeof user === "object"){
    var data = await prisma.user.findFirst({
      where:{name:user.name},
      select:{
        id:true,
        email:true,
        name:true,
        about:true,
        tags:true,
        time:true,
        question:true,
        answer:true
      }
    })
    return res.status(200).json(data)
  }
})
//update the tags or about 
app.post("/api/user",async(req:Request,res:Response)=>{
  var user_id=Number(req.headers.user_id)
  var data = req.body;
  var update = await prisma.user.update({
    where:{id:user_id},
    data:{
      about:data.about,
      tags:data.tags
    }
  })
  return res.status(200).send("user updated successfully");
})
//fetch all users

app.listen(3000);