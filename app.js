var express = require('express');
var redis = require('./models/redis.js');
var bodyParser = require('body-parser');
var mongodb = require('./models/mongodb.js');

var app = express();
// app.use(express.bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// 扔一个漂流瓶
// POST owner=xxx&type=xxx&content=xxx[&time=xxx]
app.post('/',function(req,res){
  if(!(req.body.owner && req.body.type && req.body.content)){
    if(req.body.type && (["male","female"].indexOf(req.body.type) === -1)){
      return res.json({
        code:0,
        msg:"类型错误"
      });
    }
    return res.json({
      code:0,
      msg:"信息不完整"
    });
  }
  redis.throw(req.body,function(result){
    res.json(result);
  });
});

// 建一个漂流瓶
// GET /?user=xxx[&type=xxx]
app.get('/',function(req,res){
  if(!req.query.user){
    return res.json({code:0,msg:"信息不对称"});
  }
  if(req.query.type && (["male","female","all"].indexOf(req.query.type) === -1)){
    return res.json({
      code:0,
      msg:"类型错误"
    });
  }
  redis.pick(req.query,function(result){
    if(result.code === 1){
      mongodb.save(req.query.user,result.msg,function(err){
        if(err){
          return res.json({
            code:0,
            msg:"获取漂流瓶失败，请重试！"
          });
        }
        // return res.json(result); 
        //原书中此行代码会导致"Can't set headers after they are sent."报错，注释此行即可解决
      });
    }
    res.json(result);
  });
});

// 扔回海里一个漂流瓶
// POST owner=xxx&type=xxx&content=xxx&time=xxx
app.post('/back',function(req,res){
  redis.throwBack(req.body,function(result){
    res.json(result);
  });
});

// 获取一个用户所有的漂流瓶
// GET /user/nswbmw
app.get('/user/:user',function(req,res){
  mongodb.getAll(req.params.user,function(result){
    res.json(result);
  });
});

// 获取特定id的漂流瓶
// GET /bottle/529a8
app.get('/bottle/:_id',function(req,res){
  mongodb.getOne(req.params._id,function(result){
    res.json(result);
  });
});

// 回复特定id的漂流瓶
// POST user=xxx&content=xxx[&time=xxx]
app.post('/reply/:_id',function(req,res){
  if(!(req.body.user && req.body.content)){
    return callback({
      code:0,
      msg:"回复信息不完整！"
    });
  }
  mongodb.reply(req.params._id,req.body,function(result){
    res.json(result);
  });
});

// 删除特定id的漂流瓶
// GET /delete/529a8b
app.get('/delete/:_id',function(req,res){
  mongodb.delete(req.params._id,function(result){
    res.json(result);
  });
});

app.listen(3000);
console.log('starting service at http://127.0.0.1:3000');
