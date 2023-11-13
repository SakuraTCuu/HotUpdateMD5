const Config = require("../config.js");
const Path = require("path");
const fs = require("fs");
const md5 = require("md5")
const { encryptBuffer,
    decryptBuffer,
    printInfo } = require("./encypt_data.js");

/**
 * 初始化目录
 */
function initData(list, path) {
    let fileList = fs.readdirSync(path);
    for (let i = 0; i < fileList.length; i++) {
        let file = fileList[i]
        if (file.startsWith(".") || Config.filter.includes(file)) { //隐藏目录 
            continue;
        }
        let fullPath = Path.join(path, file)
        let lstat = fs.lstatSync(fullPath)
        if (lstat.isDirectory()) {
            let data = {
                path: fullPath,
                file: file,
                isDir: true,
                children: []
            }
            list.push(data)
            initData(data.children, fullPath)
        } else {
            list.push({
                path: fullPath,
                file: file,
                isDir: false,
            })
        }
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
 * 开始加密
 */
function startEncrypt(arrFiles, md5List) {
    for (let i = 0; i < arrFiles.length; i++) {
        let info = arrFiles[i]
        if (info.isDir) {
            startEncrypt(info.children, md5List)
            continue
        }
        let relativePath = Path.relative(Config.srcPath, info.path);
        //创建输出目录
        createFolder(Config.outPath, relativePath);
        //执行加密操作
        encryptData(relativePath);
        //写入md5操作
        md5Config(relativePath, md5List)
    }
}

/**
 * 解密
 */
function startDecrypt(arrFiles) {
    for (let i = 0; i < arrFiles.length; i++) {
        let info = arrFiles[i]
        if (info.isDir) {
            startDecrypt(info.children)
            continue
        }

        let relativePath = Path.relative(Config.outPath, info.path);
        //创建输出目录
        createFolder(Config.decPath, relativePath);
        //解密图片
        decryptData(relativePath);
    }
}

/**
 * 加密
 * @param {*} file 
 * @param {*} callback 
 */
function encryptData(file) {
    let srcPath = Path.join(Config.srcPath, file);
    let outPath = Path.join(Config.outPath, file);

    console.log(`开始加密 ${srcPath}`);

    let dataBuffer = fs.readFileSync(srcPath);
    let encBuffer = encryptBuffer(dataBuffer);
    fs.writeFileSync(outPath, encBuffer);
}

/**
 * 生成md5信息
 */
function md5Config(file, md5List) {
    // md5
    let outPath = Path.join(Config.outPath, file);
    console.log(`开始md5 ${outPath}`);

    let dataBuffer = fs.readFileSync(outPath);
    //生成摘要
    let encBuffer = md5(dataBuffer);

    //保存到文件
    md5List.push({
        size: dataBuffer.length,
        file,
        data: encBuffer
    })
}

/**
 * 解密
 * @param {*} imgPath 
 * @param {*} callback 
 */
function decryptData(file) {

    let imgPath = Path.join(Config.outPath, file);
    let decPath = Path.join(Config.decPath, file);

    console.log(`开始解密 ${imgPath}`);

    let dataBuffer = fs.readFileSync(imgPath);
    let decBuffer = decryptBuffer(dataBuffer);
    fs.writeFileSync(decPath, decBuffer);
}

module.exports = {
    startDecrypt,
    startEncrypt,
    // startCompress,
    encryptData,
    initData,
    decryptData,
    md5Config
}