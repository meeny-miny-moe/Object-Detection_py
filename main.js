var http = require('http');
var fs = require('fs');
var url = require('url');
var qs=require('querystring');
const { Redirect } = require('request/lib/redirect');
var template = require('./lib/template.js');
var path=require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;   // query: {id:'CSS'}
    var pathname = url.parse(_url, true).pathname; // pathname: '/'
    //console.log(pathname);
 
    if(pathname === '/'){
      if(queryData.id===undefined){ // 메인화면일 때

        fs.readdir('./data',function(error, filelist){ // 파일 리스트 얻기
          //console.log(filelist);

          var title='Welcome'; 
          var description='Hello, Node.js';
          var list=template.list(filelist);
          var html = template.html(title, list, ` <h2>${title}</h2><p>${description}</p>`,`<a href="/create">create</a>`);
          response.writeHead(200);
          response.end(html);
        })
         
      }
      else { // id 값이 있는 경우의 코드
        fs.readdir('./data',function(error, filelist){ // 파일 리스트 얻기
          var filteredId=path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
            //var title = queryData.id;
            var sanitizedTitle=sanitizeHtml(title);
            var sanitizeDescription=sanitizeHtml(description);
            //var list=template.list(filelist);
            var html = template.html(sanitizedTitle, list,
               `<h2>${sanitizedTitle}</h2><p>${sanitizeDescription}</p>`,
               `<a href="/create">create</a> 
               <a href="/update?id=${sanitizedTitle}">update</a> 
               <form action="/delete_process" method="post" >
                   <input type="hidden" name="id" value="${sanitizedTitle}">
                   <input type="submit" value="delete">
               </form>
               `);
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } 
    else if(pathname==='/create'){ // create 눌렀을 때 링크
      fs.readdir('./data',function(error, filelist){ // 파일 리스트 얻기
        //console.log(filelist);

        var title='WEB - create'; 
        var list=template.list(filelist);
        var html = template.list(title, list, `<form action="/create_process" method="post">
        <p>
        <input type="text" name="title" placeholder="title"></input>
       </p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
         <input type="submit">
        </p>
       </form>`,'');
        response.writeHead(200);
        response.end(html);
      })
    }
    else if(pathname==='/create_process'){
        var body='';
        request.on('data', function(data) {
            body+=data; });
        request.on('end',function() {
             var post=qs.parse(body);
             var title=post.title;
             var description=post.description;
             //console.log(post.title);
             //console.log(post.title.description);
             fs.writeFile(`data/${title}`,description,'utf8',function(err){
                 response.writeHead(302,{Location: `/?id=${title}`}); // redirect한다는 의미
                 response.end();
                // response.end('success');
                
             })
        });
        
    }
    else if(pathname === '/update') { // id 값이 있는 경우의 코드
      fs.readdir('./data',function(error, filelist){ // 파일 리스트 얻기
        var filteredId=path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list=template.list(filelist);
          var html = template.html(title, list, `
          <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}"> 
             <p>
                <input type="text" name="title" placeholder="title" value=${title}></input>
             </p>
             <p>
                <textarea name="description" placeholder="description">${description}</textarea>
             </p>
             <p>
              <input type="submit">
             </p>
           </form>
          `,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
          response.writeHead(200);
          response.end(html);
        });
      });
    }
    else if (pathname==='/update_process'){
      var body='';
      request.on('data', function(data) {
       body+=data; });
      request.on('end',function() {
           var post=qs.parse(body);
           var id=post.id;
           var title=post.title;
           var description=post.description;
           
           // 제목을 변경했을 때 파일 이름 리네임하기
           fs.rename(`data/${id}`,`data/${title}`,function(error){
            fs.writeFile(`data/${title}`,description,'utf8',function(err){
              response.writeHead(302,{Location: `/?id=${title}`}); // redirect한다는 의미
              response.end();
           })
      });
    });
    }
    // 파일 삭제 눌렀을 때 경로
    else if (pathname==='/delete_process'){ 
      var body='';
      request.on('data', function(data) {
       body+=data; });
      request.on('end',function() {
           var post=qs.parse(body);
           var id=post.id;
           var filteredId=path.parse(id).base;
           // 파일 삭제하기
           fs.unlink(`data/${filteredId}`,function(error){
            response.writeHead(302,{Location: `/`}); // redirect한다는 의미
            response.end();
           })
    });
    }
    else {
      response.writeHead(404); // 파일을 찾을 수 없음
      response.end('Not found');
    } 
});
app.listen(3000);