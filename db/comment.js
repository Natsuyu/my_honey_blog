//先不要了。。。。
var mongoose = require('mongoose');
var setting = require('./setting');

var schema = mongoose.Schema({
	email: String,
	name: String,
	date: Date,
	content: String
});
var model = mongoose.model("comment", schema, "comment");
function Comment(comm){
	this.email = comm.email;
	this.name = comm.name;
	this.date = comm.date;
	this.content = comm.content 
};

module.exports = Comment;
Comment.prototype.save = function save(callback){
	var that = this;
	mongoose.connect("mongodb://"+setting.host+"/"+setting.db,function(){
		var db = mongoose.connection;
		
		var comment = new model({
			email: that.email,
			date: that.date,
			name: that.name,
			content: that.content
		});
		comment.save(function(err,ret){
			if(err) return callback(err);
			db.close(callback(ret.id)); //记得检查每次的查询是否都关掉数据库了
		});	
	});
}
