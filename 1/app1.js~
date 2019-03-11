const http = require('http');
var url  = require('url');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  	if(req.url == '/')
    	{	
		res.statusCode = 200;
  		res.setHeader('Content-Type', 'text/plain');
  		res.end('Hello World\n');
	}
	else if(req.url == '/hello')
	{
		res.statusCode = 200;
  		res.setHeader('Content-Type', 'text/plain');
  		res.end('Hello z podstrony hello\n');
	}
	else
	{
		res.statusCode = 200;
  		res.setHeader('Content-Type', 'text/plain');
  		res.end('Jakas podstrona\n');
	}
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
