const express = require("express");
const handlebars = require("express-handlebars");
const app = express();
const postService = require("./services/post-service");
const mongodbConnection = require("./configs/mongodb-connection");
const { ObjectId } = require("mongodb");

app.engine("handlebars", 
    handlebars.create({
        helpers: require("./configs/handlebars-helpers"),
    }).engine,
); // 따로 경로를 성정하지 않으면, <설정된 views 경로>/layouts/main.handlebars 템플릿이 기본 경로이다

app.set("view engine", "handlebars"); // handlerbars의 확장자를 view로 판단한다.
app.set("views", __dirname + "/views"); // __dirname이 없으면 node가 실행된 곳에서 상대경로로 지정되지만, 절대경로로 사용하기 위해서 추가함

app.use(express.json());
app.use(express.urlencoded({extended: true}));

let collection;
app.listen(5000, async() => {
    console.log("Server started");
    const mongoClient = await mongodbConnection();
    collection = mongoClient.db().collection("post");
});

// 게시판 리스트 조회
app.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";

    try{
        const [posts, paginator] = await postService.list(collection, page, search);
        res.render("home", {title: "테스트 게시판", search, paginator, posts});
    }catch(error){
        console.log(error);
        res.render("home", {title: "테스트 게시판"});
    }
});

// 게시판 작성
app.post("/write", async (req, res) => {
    const post = req.body;
    const result = await postService.writePost(collection, post);
    console.log(result);
    res.redirect(`/detail/${result.insertedId}`);
});

// 상세 게시판 조회
app.get("/detail/:id", async (req, res) => {
    const result = await postService.getDetailPost(collection, req.params.id);
    res.render("detail", {
        title: "테스트 게시판",
        post: result.value,
    });
});

// 게시판 비밀번호 체크
app.post("/check-password", async (req, res) => {
    const { id, password } = req.body;
    const post = await postService.getPostByIdAndPassword(collection, {id, password});

    if(!post){
        return res.status(404).json({ isExist: false});
    }else{
        return res.json({ isExist: true });
    }
});

// 게시판 작성 페이지로 이동
app.get("/write", (req, res) => {
    res.render("write", {title: "테스트 게시판", mode: "create"});
});

// 상세게시판 조회
app.get("/modify/:id", async (req, res) => {
    const { id } = req.params.id;
    const post = await postService.getPostById(collection, req.params.id);
    console.log(post);

    res.render("write", { title: "테스트 게시판 ", mode: "modify", post});
});

// 상세게시판 수정
app.post("/modify/", async (req, res) => {
    const { id, title, writer, password, content } = req.body;

    const post = {
        title,
        writer, 
        password,
        content,
        createdDt: new Date().toISOString(),
    };

    const result = postService.updatePost(collection, id, post);
    res.redirect(`/detail/${id}`);
});

// 게시판 제거
app.delete("/delete", async (req, res) => {
    const { id, password } = req.body;
    try{
        const result = await collection.deleteOne({ _id: ObjectId(id), password});

        if(result.deletedCount !== 1){
            console.log("삭제 실패");
            return res.json({ isSuccess: false });
        }
        return res.json({ isSuccess: true });
        
    }catch(error){
        console.error(error);
        return res.json({ isSuccess: false });
    }
});

// 댓글 추가
app.post("/write-comment", async (req, res) => {
    const { id, name, password, comment } = req.body;
    const post = await postService.getPostById(collection, id);

    if(post.comment){
        post.comments.push({
            idx: post.comments.length + 1,
            name,
            password,
            comment,
            createdDt: new Date().toISOString(),
        });
    }else{
        post.comments = [
            {
                idx: 1,
                name, 
                password,
                comment,
                createdDt: new Date().toISOString(),
            }
        ];
    }

    postService.updatePost(collection, id, post);
    return res.redirect(`/detail/${id}`);
});

// 댓글 삭제
app.delete("/delete-comment", async (req, res) => {
    const { id, idx, password } = req.body;
    const post = await collection.findOne(
        {
            _id: ObjectId(id),
            comments: { $elemMatch: { idx: parseInt(idx), password }},
        },
        postService.projectionOption,
    );

    if(!post){
        return res.json({ isSuccess: false });
    }

    post.comments = post.comments.filter((comment) => comment.idx != idx);
    postService.updatePost(collection, id, post);
    return res.json({ isSuccess: true });
});