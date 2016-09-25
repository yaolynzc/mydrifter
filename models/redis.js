var redis = require('redis'),
    // client = redis.createClient();
    client = redis.createClient(6379,'220.249.123.36'),
    client2 = redis.createClient(6379,'220.249.123.36'),
    client3 = redis.createClient(6379,'220.249.123.36');
    
// 扔一个漂流瓶
exports.throw = function(bottle,callback){
  // 先到2号数据库检查用户是否超过扔瓶次数限制
  client2.select(2,function(){
    // 获取该用户扔瓶次数
    client2.get(bottle.owner,function(err,result){
      if(result >= 10){
        return callback({
          code:0,
          msg:"今天扔瓶子的机会已经用完啦~"
        });
      }
      // 扔瓶次数加1
      client2.incr(bottle.owner,function(){
        // 检查是否是当天第一次扔瓶子
        // 若是，则设置记录该用户扔瓶次数键的生存期为1天
        // 若不是，生存期保持不变
        client2.ttl(bottle.owner,function(err,ttl){
          if(ttl === -1){
            client2.expire(bottle.owner,86400);
          }
        });
      });

      // 保留不变的代码块
      bottle.time = bottle.time || Date.now();
      // 为每个漂流瓶随机生成一个id
      var bottleId = Math.random().toString(16);
      var type = {
        male:0,
        female:1
      }
      // 根据漂流瓶类型的不同将漂流瓶保存到不同的数据库
      client.select(type[bottle.type],function(){
        console.log(type[bottle.type]);
        //以hash类型保存漂流瓶对象
        client.HMSET(bottleId,bottle,function(err,result){
          if(err){
            return callback({code:0,msg:"过会儿再试试吧！"});
          }
          // 返回结果，成功时返回OK
          callback({
            code:1,
            msg:result
          });
          client.expire(bottleId,86400);
        });
      });
    });
  });
}

// 捡一个漂流瓶
exports.pick = function(info,callback){
  // 先到3号数据库检查用户是否超过捡瓶次数限制
  client3.select(3,function(){
    // 获取该用户捡瓶次数
    client3.get(info.user,function(err,result){
      if(result >= 10){
        return callback({
          code:0,
          msg:'今天捡到瓶子的机会已经用完了'
        });
      }
      //捡瓶次数加1
      client3.incr(info.user,function(){
        // 检查是否是当天第一次捡瓶子
        // 若是，则设置记录该用户捡瓶次数键的生存期为1天
        // 如不是，生存期保持不变
        client3.ttl(info.user,function(err,ttl){
          if(ttl === 1){
            client3.expire(info.user,86400);
          }
        });
      });

      // 20%概率捡到海星
      if(Math.random() <= 0.2){
        return callback({
          code:0,
          msg:"海星"
        });
      }
      var type = {all:Math.round(Math.random()),male:0,female:1};
      info.type = info.type || 'all';

      // 根据请求的瓶子类型到不同的数据库中取
      client.select(type[info.type],function(){
        // 随机返回一个漂流瓶 id
        client.randomkey(function(err,bottleId){
          if(!bottleId){
            return callback({
              code:0,
              msg:"海星"
            });
          }
          // 根据漂流瓶id取到漂流瓶完整信息
          client.hgetall(bottleId,function(err,bottle){
            if(err){
              return callback({
                code:0,
                msg:"漂流瓶破损了..."
              });
            }
            // 返回结果，成功时包含捡到的漂流瓶信息
            callback({
              code:1,
              msg:bottle
            });
            // 从Redis中删除该漂流瓶
            client.del(bottleId);
          });
        });
      });
    });
  });
}

// 将捡到的漂流瓶扔回海里
exports.throwBack = function(bottle,callback){
  var type = {male:0,female:1};
  //为漂流瓶随机生成一个id
  var bottleId = Math.random().toString(16);
  //根据漂流瓶类型的不同将漂流瓶保存到不同的数据库
  client.select(type[bottle.type],function(){
    // 以hash类型保存漂流瓶对象
    client.hmset(bottleId,bottle,function(err,result){
      if(err){
        return callback({code:0,msg:'过会儿再试试吧！'});
      }
      // 返回结果，成功时返回OK
      callback({code:1,msg:result});
      //根据漂流瓶的原始时间戳设置生存期
      client.pexpire(bottleId,bottle.time + 86400000 - Data.now());
    });
  });
}