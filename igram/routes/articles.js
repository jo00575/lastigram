var express = require('express');
var fs = require('fs');
var mysql = require('mysql');
var path = require('path');
var moment = require('moment');
var _ = require('underscore');

var router = express.Router();
var connection = mysql.createConnection({
    host: 'igramdbdb.cpjlhnzj362n.us-west-2.rds.amazonaws.com',
    user : 'user',
    password : 'igrampwd',
    database : 'igramdb'
});
//개월수 조정피드 리스트
router.get('/:start/:end', function(request, response, next) {
    console.log("피드재조정");
    var start = request.params.start;
    var end = request.params.end;
    
	connection.query('SELECT article.id, article.month, article.img, article.time, article.title, article.context, user.nick, user.userimg FROM article LEFT OUTER JOIN user ON article.userid=user.userid WHERE article.month>=? AND article.month<=? ORDER BY time DESC;', [start, end], function (err, results) {
        if (err)
			response.send(err);
        else
        {
            var timeChangedResults = _.map(results, function(result)
                          {
                result.time = moment.utc(result.time).tz('kst').format();
                return result;
            });

            response.json(timeChangedResults);
        }
	});
});
//내 피드보기
router.get('/:user_id', function(request, response, next) {
    console.log("내 피드보기");
	connection.query('SELECT article.id, article.month, article.img, article.time, article.title, article.context, user.nick, user.userimg FROM article LEFT OUTER JOIN user ON article.userid=user.userid WHERE article.userid=? ORDER BY time DESC;', [request.params.user_id], function (err, result) {
        if (err)
			response.send(err);
        else
            response.json(result);
	});
});

//게시물 작성
router.post('/', function(request, response, next) {
    var context = request.body.context;
    var month = request.body.month;
    var title = request.body.title;
    var userid = request.session.userid;
    var img = request.files.files.path;

    console.log(userid+" 게시물작성중");
    console.log("파일 이름: "+img);
    connection.query("INSERT INTO article(userid, context, img, month, title) VALUES(?,?,?,?,?)", [
        userid,
        context,
        img,
        month,
        title
    ] , function(err, res) {
        if (err){
            response.send(err);
            console.log("쿼리문 에러!!");
        }
        else 
        {
            response.send({
                status : "ok"
            });
        }
    });
});

//좋아요
router.post('/:article_id/wink', function(request, response, next) {
    var userid = request.session.userid;

    console.log(userid+" 윙크 POST요청");
    connection.query("INSERT INTO wink(userid, articleid) VALUES(?,?)", [userid, request.params.article_id] , function(err, res) {
        if (err){
            response.send(err);
            console.log("쿼리문 에러!!");
        }
        else 
        {
            response.send({
                status : "ok"
            });
        }
    });
});

router.get('/:article_id/wink/users', function(request, response, next) {
    console.log(" 윙크 GET요청");
    
    connection.query('SELECT wink.id, user.nick FROM wink INNER JOIN user ON wink.userid=user.userid WHERE wink.articleid=?;', [request.params.article_id], function (err, result) {
        if (err)
			response.send(err);
        else{
            response.json(result);
        }
	});
});

router.get('/:article_id/wink/users/count', function(request, response, next) {
    var wink_count;
    console.log(" 윙크카운트 GET요청");
    
    connection.query('SELECT id FROM wink WHERE articleid=?;', [request.params.article_id], function (err, result) {
        if (err)
			response.send(err);
        else{
            wink_count = result.length;
            response.json(wink_count);
        }
	});
});



module.exports = router;