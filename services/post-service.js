const paginator = require("../utils/paginator");
const { ObjectId } = require("mongodb");


// 리스트 조회
async function list(collection, page, search){
    const perPage = 10;
    const query = {title: newRegExp(search, "i")};

    const cursor = collection.find(query, {limit: perPage, skip: (page-1)*perPage}).sort({
        createdDt: -1,
    });

    // 총 갯수
    const totalCount = await collection.count(query);

    // 검색한 데이터를 리스트로 변경
    const posts = await cursor.toArray();

    // 페이지 네이터 생성
    const paginatorObj = paginator({totalCount, page, perPage});

    return [posts, paginatorObj];
}


// 데이터 저장
async function writePost(collection, post){
    post.hits = 0;
    post.createdDt = new Date().toISOString;
    return await collection.insertOne(post);
}


// 패스워드는 노출 할 필요가 없으므로 결괏값으로 가져오지 않음
const projectionOption = {

    // 프로젝션 0인경우 데이터에서 빼기, 1인경우 1만표시
    projection: {
        password: 0,
        "comments.password": 0,
    },
};

// 게시판 상세조회
// 실무에서는 IP, Device등을 체크해서 어뷰징 방지함.
async function getDetailPost(collection, id){
    return await collection.findOneAndUpdate(
        { _id: ObjectId(id)},
        { $inc: 
            {hits: 1}
        }, projectionOption);
}

async function getPostByIdAndPassword(collection, {id, password}){
    return await collection.findOne({ _id: ObjectId(id), password }, projectionOption);
}

async function getPostById(collection, id){
    return await collection.findOne({ _id: ObjectId(id)}, projectionOption);
}

async function updatePost(collection, id, post){
    const toUpdatePost = {
        $set: {
            ...post,
        },
    };
    return await collection.updateOne({ _id: ObjectId(id)}, toUpdatePost);
}

module.exports = {
    list,
    writePost,
    getDetailPost,
    getPostById,
    getPostByIdAndPassword,
    updatePost,
};