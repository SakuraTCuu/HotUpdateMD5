const path = require("path");
const fs = require("fs")

let version = fs.readFileSync("ver/version.txt", "utf-8")
let newVer = Number(version) + 1
console.log("当前版本号:", version)

const dir = __dirname + "/proj" //要加密的项目路径
const verDir = __dirname + "/ver"
const Config = {
    key: "0123456789abcdef", //密钥
    filter: ['runtime'], //过滤
    srcPath: path.join(dir, "src"), //源项目路径
    // compressPath: path.join(dir, "ai_png"), //压缩后项目路径
    outPath: path.join(dir, "out"), //加密后的保存路径
    decPath: path.join(dir, "dec"), //解密后的保存路径

    version: version, //新版本号
    md5Path: path.join(verDir, `md5list_${newVer}.js`), //新版本 md5list
    md5Path_old: path.join(verDir, `md5list_${version}.js`), //上一版本md5list
    verPath: path.join(verDir, `ver_${newVer}`), //新版本差异目录
    debug: true,
    updateVersionTxt: function () {
        fs.writeFileSync("ver/version.txt", newVer + "")
    }
}

module.exports = Config;
