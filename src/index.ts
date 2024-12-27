// GLOBAL IMPORTS
import express, { Request, Response } from 'express';
import "express-async-errors";
import dotenv from 'dotenv';
// LOCAL IMPORTS
import { ROOT_DIR } from './utils/root-dir';
import errorHandler from './middleware/errorHandler';
import { connectionMongoDb } from './configs/connection';
// ROUTE HANDLERS
import searchRoutes from "./routes/search.routes";

dotenv.config({ path: `${ROOT_DIR}/.env` });

const { PORT, NODE_ENV, MONGO_URI } = process.env;
console.table({ ROOT_DIR, PORT, NODE_ENV, MONGO_URI });
const app = express();

app.use(express.json());


if (!PORT) throw new Error("PORT is not defined in .env file");
if (!MONGO_URI) throw new Error("MONGO_URI is not defined in .env file");

app.use("/api/flight", searchRoutes);
app.use("/api", (req: Request, res: Response) => {
    res.json({ message: "9I API" });
})
connectionMongoDb(MONGO_URI);
app.listen(PORT, () => {
    console.log(`9I RUNNING ON PORT ${PORT}`);
    console.log(`ACCESS LINK : http://localhost:${PORT}/api`);
})

app.use(errorHandler);
