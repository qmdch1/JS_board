const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://<아이디>:<비밀번호>@<클러스터>/test";

module.exports = function(callback){
    return MongoClient.connect(uri, callback);
}