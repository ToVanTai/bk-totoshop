const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const queryString = require("query-string");
// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
    res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
    if (req.method === "POST") {
        req.body.createdAt = Date.now();
    }
    // Continue to JSON Server router
    next();
});
router.render = (req, res) => {
    const headers = res.getHeaders();
    const totalCountHeader = headers["x-total-count"];
    if (req.method === "GET" && totalCountHeader) {
        const queryParams = queryString.parse(req._parsedOriginalUrl.query);
        const result = {
            data: res.locals.data,
            pagination: {
                page: Number.parseInt(queryParams._page),
                limit: Number.parseInt(queryParams._limit),
                totalRows: totalCountHeader,
            },
        };
        return res.jsonp(result);
    }
    res.jsonp(res.locals.data);
};
// Use default router
server.use("/api", router);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log("JSON Server is running");
});
