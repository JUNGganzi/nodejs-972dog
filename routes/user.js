const express= require('express');
const router = express.Router();
const mysql = require('mysql');
const nodemailer = require('nodemailer');
// const crypto = require('crypto')
// var salt = '';
// var pw = '';

// crypto.randomBytes(64, (err, buf) => {
//     if (err) throw err;
//     salt = buf.toString('hex');
// });
// crypto.pbkdf2('userPw', salt, 100000, 64, 'sha512', (err, derivedkey) => {
//     if (err) throw err;
//     pw = derivedkey.toString('hex');
// })


var transporter = nodemailer.createTransport({  // transporter 에서 보낼 메일아이디와 비번 설정
    service: 'gmail',
    auth: {
        user:'bodercoding@gmail.com',
        pass:'codingboder'
    }
});


var connection = mysql.createConnection({  // 데이터베이스 연동폼 , 
    host : "localhost",
    user: "root",
    password: "99189176",
    database: "database",
    port:"3306",
});


// 회원가입 이메일 인증 !
router.post(('/signup'), function (req, res, next){
    var today = new Date();
    var email = req.body.email;
    var name = req.body.name;
    var password = req.body.password;
    var created = today;
    var modified = today;
    var datas = [email, name, password, created, modified] ;
    var sql = "INSERT INTO user (userEmail, userName, userPw, created, modified, isActive) values(?,?,?,?,?,0)";

    connection.query(sql, datas, function(err, results){
        if (err) {
            console.log("에러발생", err);
            res.send({
                "code" : 400,
                "실패" : "에러 발생"
            });
        } else {
            console.log('가입완료', results);
            res.redirect('/welcome')
        }
        var mailOption = {
            from : 'bodercoding@gmail.com',
            to : email,
            subject : '이메일 인증해주세요',
            html : '<p>아래의 링크를 클릭해서 인증해주센!</p>' +
            "<a href='http://localhost:3000/user/confirm/account" + '?email=' + email +" '>인증하기</a>"
        };
        transporter.sendMail(mailOption, function(err, res){
            if (err) {
                console.log(err);
            } else {
                console.log('이메일 발송완료')
            }
            transporter.close();
        });
    });
});


router.post(('/login'), function(req,res,next){
    var email = req.body.email;
    var password = req.body.password;

    var sql = "SELECT * FROM user WHERE userEmail = ?";

    connection.query(sql, email, function(err, results){
        if (err) {
            console.log("에러발생", err);
            res.send({
                "code" : 400,
                "실패" : "로그인 실패"
            });
        } else {
            if(results.length > 0) {
                if(results[0].userPw == password, results[0].isActive == 1) {
                    console.log(results)
                    res.redirect('/petinfo/list')
                    // res.send({
                    //     "code" : 200,
                    //     "성공" : "로그인 성공"
                    // })
                } else {
                    res.send({
                        "code" : 204,
                        "실패" : "이메일이나 비밀번호가 다릅거나, 인증이 되지 않았습니다"
                    });
                }
            } else {
                res.send({
                    "code" : 204,
                    "실패" : "이메일 주소가 다르거나 , 인증이 되지 않았습니다"
                });
            }
        }
    });
});


// 이메일인증시 isActive 값 1 로변경
router.get(('/confirm/account'), function(req, res){
    var email = req.query.email;
    var data = "%" + email + "%";

    // var sql = "SELECT * FROM user WHERE userEmail LIKE ? UPDATE user SET isActive"
    var sql2 = "UPDATE user SET isActive = '1' WHERE userEmail LIKE ?";

    connection.query(sql2, data, function(err, results){
    if (err) {
        console.log("에러발생", err);
        res.send({
            "code" : 400,
            "실패" : "에러 발생"
        })
    } else {
        console.log("인증완료", results);
        res.send({
            "code" : 200,
            "성공" : "인증완료",
            "메시지" : "페이지에 재접속해서 로그인 해주세요!!"
        });
    }
});
});


module.exports = router;