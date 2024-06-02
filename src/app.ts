import express from "express";

const port = 4000;

const app = express();


// * Basic route
app.get("/", (req, res) => {
    res.send("Welcome to Ecommerce v2 Application!");
})

app.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
})
