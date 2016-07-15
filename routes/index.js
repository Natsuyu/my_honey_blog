var express = require('express');
var router = express.Router();
var Article = require('../db/article');
var Comment = require('../db/comment');
var setting = require('../db/setting');
var formidable = require('formidable');
var setting = require('../setting');
var fs = require('fs');
var url = require('url');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/page',function(req, res, next){
	var query = {title: 'MongoDB test'};
	var ret = getData("alls");
	console.log(ret);
	res.render('index', {title: 'Express'});
});
//登录后台
router.get('/login',function(req, res, next){
	res.render('login');
});

router.post('/login',function(req, res){
	var name = req.body['username'],
		pwd = req.body['pwd'];
	if(name == 'admin' && pwd == "111"){
		// req.session.login = "true";  先不用验证了。。。『express-session』
		return res.redirect('/control');
	}
	else 
	{	
		return res.redirect('/login');  //当前页面？
	}
});
router.get('/control', function(req, res){
	Article.get(null, null, true, function(data, time){
		console.log(data);
		res.render("admin",{title: "Gather", data: data, navi: time, admin: true});
	});
});

router.post('/delete', function(req, res){
	Article.del(req.body['id'],function(data, err){
		if(err) res.send("error");
		else res.send({
			success: "OK"
		});
	});
});

router.post('/update', function(req, res){

})
router.get('/edit',function(req, res, next){
	return res.render('ueditor',{ cont_title: null, content: null});
})
router.get('/edit/:id',function(req, res, next){
	var id = req.params.id;
	console.log("this is :",id);
	if(id){
		Article.get(id,null,false, function(data, err){
			console.log("!!!!!!!!!!",data[0].title);
			res.render('ueditor',{ cont_title: data[0].title, content: data[0].content, id: data[0]._id});
		})
	}
	else res.render('ueditor');
})

router.get('/document/:id',function(req, res){
	Article.get(req.params.id,null,true, function(data, time){
		console.log(data);
		res.render("document", { title: "Article", data: data, navi: time});
	})
})

router.get('/list/:num',function(req, res){
	var reg = /\d+$/;
	var url_path = req.originalUrl.replace(reg,"");
	var num = parseInt(req.params.num),
		perPage = setting.perPage;
	Article.get(null, null, true, function(data, time){
		console.log(data.length);
		var totnum = Math.ceil(data.length / perPage);
		var start, end;
		// var end = num+disPage >= totnum ? totnum : num+disPage,
			// start = (end==totnum&&totnum>disPage)?(end-disPage):(num >= disPage ? num : 0);
		if(num==0) {start=0,end=2;}
		else {if(num==totnum-1) start=(totnum-3)>=0?(totnum-3):0,end=totnum-1;
		else start=num-1,end=num+1;}
		if(end>=totnum) end=totnum-1;

		res.render("list",{
			title: "List", 
			data: data.slice(num*perPage,(num+1)*perPage), 
			navi: time, 
			len: totnum, 
			start: start,  //guide span start
			end: end,      //end span start
			active: num,
			path: url_path
		});
	});
})

router.get('/archieve/:year/:month/:num', function(req, res){
	var reg = /\d+$/;
	var url_path = req.originalUrl.replace(reg,"");
	var num = parseInt(req.params.num),
		perPage = setting.perPage;
	Article.get(null, {year:req.params.year,month:req.params.month}, true, function(data, time){
		console.log(data.length);
		var totnum = Math.ceil(data.length / perPage);
		var start, end;
		// var end = num+disPage >= totnum ? totnum : num+disPage,
			// start = (end==totnum&&totnum>disPage)?(end-disPage):(num >= disPage ? num : 0);
		if(num==0) {start=0,end=2;}
		else {if(num==totnum-1) start=(totnum-3)>=0?(totnum-3):0,end=totnum-1;
		else start=num-1,end=num+1;}
		if(end>=totnum) end=totnum-1;

		res.render("list",{
			title: "List", 
			data: data.slice(num*perPage,(num+1)*perPage), 
			navi: time, 
			len: totnum, 
			start: start,  //guide span start
			end: end,      //end span start
			active: num,
			path: url_path
		});
		// res.render("list", {title: "Gather part", data: data, navi: time});
	});
});

router.get('/about',function(req, res){
	res.render('resume',{ title: "Resume"});
})

router.post('/edit',function(req, res){
	var date = req.body['date']?req.body['date']:(new Date());
	// console.log(date.getMonth());
	var post = {
		title: req.body['title'],
		date: date,
		yearmonth: date.getFullYear()+"/"+(parseInt(date.getMonth())+1),
		tags: req.body['tags'],
		content: req.body['content'],
		id: req.body["id"]
	};

	var arti = new Article(post);
	arti.save(function(id){
		// res.render('document',{ data: data});
		// return res.redirect('/document/'+id);
		res.send({
			status: "OK"
		});
	})
})

router.post('/upload', function(req, res){
		var uploadfoldername = 'uploadfiles';
		var uploadfolderpath = 'public/' + uploadfoldername;
		var server = 'localhost';
		var port = setting.port;
		console.log('定位到 /upload 路由');

		// 使用第三方的 formidable 插件初始化一个 form 对象
		var form = new formidable.IncomingForm();

		// 处理 request
		form.parse(req, function (err, fields, files) {
			if (err) {
				return console.log('formidable, form.parse err');
			}

			console.log('formidable, form.parse ok');

			var item;

			// 计算 files 长度
			var length = 0;
			for (item in files) {
				length++;
			}
			if (length === 0) {
				console.log('files no data');
				return;
			}

			for (item in files) {
				var file = files[item];
				// formidable 会将上传的文件存储为一个临时文件，现在获取这个文件的目录
				var tempfilepath = file.path;
				// 获取文件类型
				var type = file.type;

				// 获取文件名，并根据文件名获取扩展名
				var filename = file.name;
				var extname = filename.lastIndexOf('.') >= 0
								? filename.slice(filename.lastIndexOf('.') - filename.length)
								: '';
				// 文件名没有扩展名时候，则从文件类型中取扩展名
				if (extname === '' && type.indexOf('/') >= 0) {
					extname = '.' + type.split('/')[1];
				}
				// 将文件名重新赋值为一个随机数（避免文件重名）
				filename = Math.random().toString().slice(2) + extname;

				// 构建将要存储的文件的路径
				var filenewpath = uploadfolderpath + '/' + filename;

				// 将临时文件保存为正式的文件
				fs.rename(tempfilepath, filenewpath, function (err) {
					// 存储结果
					var result = '';

					if (err) {
						// 发生错误
						console.log('fs.rename err');
						result = 'error|save error';
					} else {
						// 保存成功
						console.log('fs.rename done');
						// 拼接图片url地址
						result = 'http://' + server + ':' + port + '/' + uploadfoldername + '/' + filename;
					}
					
					// 返回结果
					res.writeHead(200, {
						'Content-type': 'text/html'
					});
					res.end(result);
				}); // fs.rename
			} // for in 
		});

})

router.get("/favorite",function(req, res){
	return res.render("favorite");
})
module.exports = router;
