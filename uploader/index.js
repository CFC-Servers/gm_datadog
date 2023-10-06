const Koa = require("koa");
const uploadFile = require("./uploader.js");

const logsDir = "/app/service-logs";
const app = new Koa();

app.use(async function(ctx) {
    console.log(`${ctx.method} ${ctx.url}`);

    const body = ctx.request.body;

    const serverName = body.serverName;
    if (!serverName) ctx.throw(400, ".serverName required");

    const fileName = body.fileName;
    if (!fileName) ctx.throw(400, ".fileName required");

    const realPath = `${logsDir}/${body.serverName}/${body.fileName}`;
    const filePath = `${serverName}/${fileName}`;

    await uploadFile(realPath, filePath);

    ctx.response.status = 204;
    ctx.response.message = "";
});

app.listen(3000);
