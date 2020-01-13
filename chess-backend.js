// var http = require('http');
var url = require('url');
var fs = require('fs');
var mysql = require('mysql');

const express = require('express');
const app=express();
const port = 82;

var events = require('events');
var eventEmitter = new events.EventEmitter();

var debugfile="/home/public/chess-debug.dat";
var pw = require('./chess-pw.js');
class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    escape( thing ) {
        return this.connection.escape( String(thing));
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

var dbms=new Database({
  host: "127.0.0.1",
  user: pw.user,
  password: pw.pass,
  database: "messagerelay"
});

function nowIs() { 
	function pad(n) {
		return n<10 ? '0'+n : n
	}
	return new Date().getFullYear() + "-"+pad(+ new Date().getMonth()+1) + '-'+ pad(new Date().getDate()) + ' ' + pad(+ new Date().getHours() ) + ':' + pad(+ new Date().getMinutes() );
}
console.log("STARTED at " + nowIs());

var lib = require('./chess-library.js');
var pending=0;

app.use(express.static('/var/www/chess/html/'));
app.get("/db/",(request, response) => db(request, response));
app.listen(port, () => console.log(`STARTED on port ${port}`));

async function db(request, response) {
    var reply='';
    
    async function get_by_name(name) {
        var r;
        await dbms.query(
            "SELECT * FROM things WHERE Tname LIKE " + dbms.escape(name))
          .then( results => {
          if(results.length != 1){
            r='error b90';
          }
          else {
            if ( results[0].Tid > 0 ) {
              r=results[0].Tcontent;
            }
            else {
              r='error b97';
            }
          }
          return r;
        }
      )
      .catch( err => {
        console.log(err);
      });
      return r;
    }

    async function get_things(mobile) {
        var r;
        console.log("SELECT * FROM things JOIN genus ON things.Tgenus=genus.Gid WHERE Gmobile="+ mobile);
        await dbms.query(
            "SELECT * FROM things JOIN genus ON things.Tgenus=genus.Gid WHERE Gmobile="+ (dbms.escape(mobile)))
          .then( results => {
          if(results.length < 1){
            r='error b115';
          }
          else {
            r=JSON.stringify(results);
          }
          return r;
        }
      )
      .catch( err => {
        console.log(err);
      });
      return r;
    }
	
  console.log( nowIs());
  console.log('CONNECT -> DB -> '+request.method + ' ' + String(request.url));
  fs.appendFile(debugfile, 'CONNECT\n', () => {});
  fs.appendFile(debugfile, nowIs() + "\n", () => {});
  fs.appendFile(debugfile, 'Method: ' + request.method + '\n', () => {});
  for (var key in request.headers) {
      fs.appendFile(debugfile,key + " -> " + request.headers[key] + "\n", () => {});
  }
  response.writeHead(200, {'Content-Type': 'text/html'});
//   response.write("<!DOCTYPE html><html><head>" );
//   response.write("</head><body>");
  if (request.method || 'GET') {
    var cgi = url.parse(request.url, true).query;
    if (lib.isdefined(cgi.name)) {
//       console.log(cgi.name);
      reply=await get_by_name(cgi.name);
    }
    else if (lib.isdefined(cgi.cat)) {
      if (cgi.cat == 'fauna') {
        reply=await get_things(1);
      }
      else if (cgi.cat == 'flora') {
        reply=await get_things(0);
      }
      else if (cgi.cat == 'object') {
        reply='{}';
      }
      else {
        reply='error b160';
      }
    }
//     console.log('RESPONSE -> ' + reply);
    response.write(String(reply));
    response.end();
  }
  else {
    reply='DB: Not Found';
//     console.log('RESPONSE -> ' + reply);
    response.write(String(reply));
    response.end();
  }
  
}
/*
MariaDB [grassworld_001]> SELECT * FROM things JOIN genus ON things.Tgenus=genus.Gid WHERE Gmobile=0;
+-----+-------+---------+----------+--------+------+------+------+---------------------+-----+-------+---------+-----------+--------------+-------------+
| Tid | Tname | Tstatus | Tcontent | Tgenus | Tx   | Ty   | Tz   | ts                  | Gid | Gname | Gmobile | Gpriority | Gdescription | Gimage      |
+-----+-------+---------+----------+--------+------+------+------+---------------------+-----+-------+---------+-----------+--------------+-------------+
|   5 | Twig  | dead    |          |      2 |    4 |    1 |    0 | 2020-01-12 14:24:14 |   2 | twig  |       0 |      NULL | NULL         | plant02.png |
|  11 | Twig  | dead    | NULL     |      2 |    9 |    4 |    0 | 2020-01-12 14:24:14 |   2 | twig  |       0 |      NULL | NULL         | plant02.png |
+-----+-------+---------+----------+--------+------+------+------+---------------------+-----+-------+---------+-----------+--------------+-------------+

MariaDB [grassworld_001]> SELECT * FROM things JOIN genus ON things.Tgenus=genus.Gid WHERE Gmobile=1;
+-----+---------+---------+----------+--------+------+------+------+---------------------+-----+------------+---------+-----------+--------------+---------------------------+
| Tid | Tname   | Tstatus | Tcontent | Tgenus | Tx   | Ty   | Tz   | ts                  | Gid | Gname      | Gmobile | Gpriority | Gdescription | Gimage                    |
+-----+---------+---------+----------+--------+------+------+------+---------------------+-----+------------+---------+-----------+--------------+---------------------------+
|   2 | Bob     | live    |          |      1 |    0 |    0 |    0 | 2020-01-12 14:24:14 |   1 | schplágen  |       1 |      NULL |              | anmhithe02-positioned.png |
|   3 | Síofra  | live    |          |      1 |    1 |    1 |    0 | 2020-01-12 14:24:14 |   1 | schplágen  |       1 |      NULL |              | anmhithe02-positioned.png |
|   4 | Paul    | live    |          |      1 |    2 |    1 |    0 | 2020-01-12 14:24:14 |   1 | schplágen  |       1 |      NULL |              | anmhithe02-positioned.png |
+-----+---------+---------+----------+--------+------+------+------+---------------------+-----+------------+---------+-----------+--------------+---------------------------+*/
