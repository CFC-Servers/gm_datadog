const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const { uploadFile } = require("./uploader.js");

const logsDir = "/app/service-logs";

const app = new Koa();
const router = new Router();

router.post("/upload", async function(ctx) {
    console.log(`${ctx.method} ${ctx.url}`);

    const body = ctx.request.body;

    const serverName = body.serverName;
    if (!serverName) ctx.throw(400, ".serverName required");

    const fileName = body.fileName;
    if (!fileName) ctx.throw(400, ".fileName required");

    const realPath = `${logsDir}/${body.serverName}/${body.fileName}`;
    const filePath = `${serverName}/${fileName}`;
    console.log("Uploading...", realPath, filePath);

    await uploadFile(realPath, filePath);

    ctx.response.status = 204;
    ctx.response.message = "";
});

app.use(bodyParser());
app.use(router.routes());

console.log("Starting uploader service");
app.listen(3000);
