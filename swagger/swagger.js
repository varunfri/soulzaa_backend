import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My Node API",
            version: "1.0.0",
            description: "API documentation for my Node.js project",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local server",
            },
        ],
    },
    apis: ["./routes/*.js"], // where your route comments live
};

// const swaggerSpec = swaggerJSDoc(options);

const swaggerSpec = YAML.parse(
    fs.readFileSync("./swagger.yaml", "utf8")
);


export const swaggerDocs = (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

