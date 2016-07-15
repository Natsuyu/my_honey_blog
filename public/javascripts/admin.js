var remove = $(".remove"),
	update = $(".update"),
	add = $(".add");
remove.click(function(){
	var $that = $(this);
	console.log($that.parents(".content").find("a").attr("href"));
	var reg = /\/document\/((\w)+)?/g;
	var id = reg.exec($that.parents(".content").find("a").attr("href"))[1];

	$.ajax({
		url: '/delete',
		data: {
			id: id
		},
		type: "post",
		success: function(){
			console.log("success");
			$that.parents(".content").remove();
		},
		error: function(err){
			console.log(err);
		}
	});
});

update.click(function(){
	var $that = $(this);
	var reg = /\/document\/((\w)+)?/g;
	var id = reg.exec($that.parents(".content").find("a").attr("href"))[1];
	console.log("from page","/edit/"+id);
	window.location.href = "/edit/"+id;
});

add.click(function(){
	window.location.href="/edit";
})