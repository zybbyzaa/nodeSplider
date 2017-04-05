var request = require('superagent');
var charset = require('superagent-charset');
var retry = require('superagent-retry');
var cheerio = require('cheerio');
var async = require('async');
var json2csv = require('json2csv');
var fs  = require('fs');

charset(request);
retry(request);

function getProduct(url,cb){
    request
        .agent()
        .get(url)
        .charset('gbk')
        .end(function(err, res){
            if (err) {
                console.log(err);
                cb(err);
            }
            $ = cheerio.load(res.text);
            var startNo = productList.length;
            $('#J_ItemList > .product').each((index,elem) => {
                var product = $(elem);
                productList.push({
                    id: startNo + index + 1,
                    name: product.find('.productTitle a').text().trim(),
                    price: product.find('.productPrice em').attr('title'),
                    status: product.find('.productStatus em').text().trim(),
                    url: product.find('.productTitle a').attr('href')
                })
            })
            console.log('抓取url：' + url + '结束');  
            cb(null);
        });
}

function getProductList() {
    var productList = [];
    var productUrl = [];
    for (var i = 0; i < 100; i++) {
        productUrl.push("https://list.tmall.com/search_product.htm?q=%CC%E2%BF%E2&s=" + i*60);
    }
    async.eachSeries(productUrl, function(item, callback) {
        console.log('开始抓取url：' + item);    
        getProduct(item, callback);
    }, function(err) {
        if (err) {
            return console.log(err);
        }
        var fields = ['id', 'name', 'price', 'status', 'url'];
        var csv = json2csv({ data: productList, fields: fields });
        fs.writeFile('data/productList.csv', csv,  function(err) {
            if (err) {
                return console.error(err);
            }
            console.log(new Date(),"：数据写入成功！");
        });
    });
}

function getCommentList() {
    var commentList = [];
    var commentUrl = [];
    for (var i = 0; i < 1218; i++) {
        commentUrl.push("https://detail.tmall.com/item.htm?spm=a230r.1.14.1.vo3HJW&id=535389650658&ns=1&abbucket=6");
    }
    async.eachSeries(commentUrl, function(item, callback) {
        console.log('开始抓取url：' + item);    
        getProduct(item, callback);
    }, function(err) {
        if (err) {
            return console.log(err);
        }
        var fields = ['id', 'name', 'price', 'status', 'url'];
        var csv = json2csv({ data: commentList, fields: fields });
        fs.writeFile('data/commentList.csv', csv,  function(err) {
            if (err) {
                return console.error(err);
            }
            console.log(new Date(),"：数据写入成功！");
        });
    });
}



