// 读取目录下的所有代码文件
// 加密并生成md5 , 加密方法不固定
// 对比生成,提取差异文件
//项目侧 , 对比远程md5文件, 拉取差异文件
const fs = require("fs")
const Path = require("path")
const Config = require("./config");
const { startEncrypt, startDecrypt, initData, md5Config } = require("./src/main");

/**
 * 生成新的差异文件
 */
function updateDiff(md5_new) {
    //找出上个版本的md5
    let md5_old;
    if (Config.version !== "0") {
        md5_old = require(Config.md5Path_old)
    }

    let diffList = []
    if (md5_old) {
        for (const k in md5_new) {
            let newInfo = md5_new[k]
            let oldInfo = md5_old[k]
            if (newInfo.md5 !== oldInfo.md5) {
                //有变化
                //迁移差异包
                diffList.push(k)
            }
        }
    } else {
        diffList.push(...Object.keys(md5_new))
    }

    //迁移差异文件
    for (let i = 0; i < diffList.length; i++) {
        let outPath = Path.join(Config.outPath, diffList[i])
        let verPath = Path.join(Config.verPath, diffList[i])
        let content = fs.readFileSync(outPath)
        if (!fs.existsSync(verPath)) {
            //递归创建目录
            createFolder(Config.verPath, diffList[i])
        }
        fs.writeFileSync(verPath, content)
    }
}

/**
 * 创建目录
 * @param {*} filePath 文件绝对路径
 */
function createFolder(rootPath, relativePath) {
    //拼接输出目录
    let outPath = Path.join(rootPath, relativePath);
    let outFolder = Path.dirname(outPath);
    fs.mkdirSync(outFolder, { recursive: true });
}

/**
 * 保存一份最新的md5
 * @param {*} md5List 
 */
function saveMd5(md5List) {
    let md5_new = {}
    let outStr = "module.exports = {\n"
    for (let i = 0; i < md5List.length; i++) {
        let info = md5List[i]
        outStr += `['${info.file}']:`
        outStr += `{md5:'${info.data}',size:${info.size}},\n`

        md5_new[info.file] = {
            md5: info.data,
            size: info.size
        }
    }
    outStr += "}"
    fs.writeFileSync(Config.md5Path, outStr)
    //更新版本号
    Config.updateVersionTxt()
    console.log("提取差异文件到->", Config.verPath)
    updateDiff(md5_new)
}

async function main() {
    let list = [];
    let md5List = []
    console.log("初始化数据...")
    initData(list, Config.srcPath)
    console.log("开始加密...")
    startEncrypt(list, md5List); //加密
    // console.log("开始解密...")
    // startDecrypt(list) //解密
    saveMd5(md5List)
    console.log("生成完成: ")
    console.log("version:", Config.version)
    console.log("md5:", Config.md5Path)
    console.log("差异文件目录:", Config.verPath)
}

main();