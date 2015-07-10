var express = require('express');
var fs = require('fs');
var mysql = require('mysql');
var path = require('path');

var router = express.Router();
var connection = mysql.createConnection({
    host : 'igramdbdb.cpjlhnzj362n.us-west-2.rds.amazonaws.com',
    user : 'user',
    password : 'igrampwd',
    database : 'igramdb'
});

//로그인구현
router.post('/login', function(request, response, next) {
    var result = {};
    
    if (request.session.userid != undefined){
        request.session.destroy();
		result.expired = true;
    }

    result.userid = request.session.userid = request.body.userid;
    result.userpw = request.body.userpw = request.body.userpw;
    console.log(result.userid + " 로그인완료");
    response.json(result);
});

router.get('/logout', function(request, response, next) {
	var result = {};
	
	if (request.session.userid != undefined) {
		request.session.destroy();
		result.expired = true;
		response.json(result);
	}
	else {
        console.log("로그아웃 오류-세션없음");
		response.sendStatus(403);
	}
});

//모든 회원 리스트 반환
router.get('/', function(request, response, next) {
    connection.query('SELECT * FROM user;', function (error, result) {

		if (result.length > 0)
			response.json(result);
		else
			response.status(503).json({ result : false, reason : "Cannot find selected user info" });
		}); 
});

//회원가입
router.post('/', function(request, response, next) {
    console.log("회원가입 중");
    console.log(request.body);
    var userid = request.body.userid;
    var userpw = request.body.userpw;
    var nick = request.body.nick;
    var profile = request.body.profile;
    var year = request.body.year;
    var month = request.body.month;
    var day = request.body.day;
    console.log(userid);
    console.log(userpw);
    console.log(nick);
    console.log(profile);
    console.log(year);
    console.log(month);
    console.log(day);

    connection.query("INSERT INTO user(userid, userpw, nick, profile, year, month, day)  VALUES(?,?,?,?,?,?,?);", [
        userid,
        userpw,
        nick,
        profile,
        year,
        month,
        day
    ], function(err, res) {
        if (err){
            response.send(err);
            console.log(err);
            console.log("쿼리문 오류");
        }
        else
        {
            response.send({
                status : "ok"
            });
        }
    });
});

//회원가입사진
router.post('/photo/:userid', function(request, response, next) {
    console.log("회원가입-사진 중");
    var userimg = request.files;
    var userid = request.params.userid;
    console.log(request.body);
    console.log(userimg);
    console.log(userid);

    connection.query("UPDATE user SET userimg=? WHERE userid=?;", [
        userimg.files.path,
        userid
    ] , function(err, res) {
        if (err){
            response.send(err);
            console.log(err);
            console.log("쿼리문 오류");
        }
        else
        {
            console.log("삽입 완료");
            response.send({
                status : "ok"
            });
        }
    });
});


//회원정보 반환
router.get('/:user_id', function(request, response, next) {
    console.log("회원정보반환");
	connection.query('select * from user where userid=?;', [request.params.user_id], function (error, result) {

		if (result.length > 0)
			response.json(result);
		else
			response.status(503).json({ result : false, reason : "Cannot find selected user info" });
		}); 

	});

     module.exports = router;