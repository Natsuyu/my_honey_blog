var mongoose = require('mongoose');
var setting = require('./setting');

var schemaArt = mongoose.Schema({
	title: String,
	date: Date,
	tags: String,
	content: String
});
var schemaMonth = mongoose.Schema({
	date: String,
	number: Number
});
var model = mongoose.model("article", schemaArt, "article");
var model2 = mongoose.model("check", schemaMonth, "date_check");
function Article(arti){
	this.title = arti.title;
	this.date = arti.date,
	this.tags = arti.tags,
	this.content = arti.content,
	this.yearmonth = arti.yearmonth,
	this.id = arti.id
};

module.exports = Article;
//为什么save用prototype，get不用???? 
Article.prototype.save = function save(callback){
	var that = this;
	mongoose.connect("mongodb://"+setting.host+"/"+setting.db,function(){
		console.log('open');
		var db = mongoose.connection;
		
		var article  = new model({
			title: that.title,
			date: that.date,
			tags: that.tags,
			content: that.content
		});
		var id = that.id;

		if(id){
			model.findByIdAndUpdate(id,{
				title: that.title,
				date: that.date,
				tags: that.tags,
				content: that.content
			},function(err,data){
				console.log(err, data);
				callback(id);
			})
		}
		else{
			article.save(function(err,ret){
				if(err) return callback(err);
				model2.findOne({date: that.yearmonth},function(err,data){
					if(err) {
						var archieve = new model2({
							date: that.yearmonth,
							number: 1
						});
						archieve.save(function(err,data){
							db.close();
							return callback(ret.id);
						})
					}
					else
					{
						data.update({number: data.number + 1},function(err,data){
							db.close();
							return callback(ret.id);
						});
					}
				})
				// callback(ret.id);
			});		
		}
	});
}

Article.get = function get(id, archieve, getArchi, callback){
	mongoose.connect("mongodb://"+setting.host+"/"+setting.db,function(){
		console.log('open', id);
		console.log(id,archieve, callback);
		var db = mongoose.connection;
		if(id)
		{
			model.find({_id:id},function(err, document){
				if(err) callback(err);
				if(getArchi)
				{
					model2.find(function(err,data){
						db.close();
						callback(document, data);
					});
				}else{
					db.close();
					callback(document);
				}
			});
		}
		else if(archieve){
			console.log("访问日期分类");
			
			var year = archieve.year, month = archieve.month;
			var start = new Date(year, parseInt(month)-1,1);
			if(month>12) month = 0,year++;
			var end = new Date(year, month,1);

			var test = [];
			model.find({date:{"$gte":start, "$lt": end}},function(err, document){
				model2.find(function(err,data){
					db.close();
					callback(document, data);
				});
			})
		}
		else{
			model.find(function(err, document){
				model2.find(function(err,data){
					db.close();
					callback(document, data);
				});
			});
		}
	});
};


Article.update = function update(id, callback){
	mongoose.connect("mongodb://"+setting.host+"/"+setting.db,function(){
		var db = mongoose.connection;
		console.log(id);
		model.findByIdAndRemove(id,function(err){
			console.log("find??");
			db.close();
			if(err) return callback(null,err);
			return callback();
		})
	});
}

Article.del = function del(id, callback){
	mongoose.connect("mongodb://"+setting.host+"/"+setting.db,function(){
		var db = mongoose.connection;
		console.log(id);
		model.findByIdAndRemove(id,function(err){
			console.log("find??");
			db.close();
			if(err) return callback(null,err);
			return callback();
		})
	});
}
Article.test = function test(callback){
	var arr = [1,2,3,4,5,6,7,8];
	var ret = 0;
	arr.forEach(function(item, index, arr){
		ret +=item;
	})
	callback(ret);
}
