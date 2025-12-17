// here we create express instance and maintain the required routes for server
import express from "express";
import auth_router from './routes/auth_route.js';
import user_router from './routes/user_profile_route.js';

const app = express();

app.use(express.json()); //making server to use the json() for parsing
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.get('/', (req, res) => {
    res.send("Server is running");
}); // this route to get to know the server is running 


app.use('/auth', auth_router);
app.use('/user', user_router)


// export the app 
export default app;