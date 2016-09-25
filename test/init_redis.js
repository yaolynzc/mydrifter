var request = require('request');

// json:{"owner":"bottle" + i,"type":"male","content":"content" + i}
// 第1种post json格式的数据
for(var i=1;i<=5;i++){
  (function(i){
    request.post(
      'http://127.0.0.1:3000',
      {
        json:{
          owner:'bottle' + i,
          type:'male',
          content:'content' + i
        }
      },
      function (error,response,body){
        if(!error && response.statusCode == 200){
          console.log(body)
        }
      }
    );
  })(i);
}

// json:{"owner":"bottle" + i,"type":"female","content":"content" + i}
// 第2种post json格式的数据
for(var i=6;i<=10;i++){
  (function(i){
    request({
      url:'http://127.0.0.1:3000',
      method:'POST',
      json:true,
      body:{
        owner:'bottle' + i,
        type:'female',
        content:'content' + i
      }
    },function(error,response,body){
      console.log(response.body);
    });
  })(i);
}

// 以上两个循环同时运行时，10条数据都会插入redis的1号数据库，male类型的数据并未进入0号数据库
// 需要分别执行，才能各自进入0号和1号数据库