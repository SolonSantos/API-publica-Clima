#! /usr/bin/env node
var https = require('https')
var querystring = require('querystring')

var databaseUrl = �mydb�; // �username:teste@example.com/mydb�
var collections = [�users�, �reports�]
var db = require(�mongojs�).connect(databaseUrl, collections);
 
var arguments = process.argv.splice(2, process.argv.length -1).join(' ')
var search    = querystring.stringify({ address: arguments })
 
https
  .get('https://maps.googleapis.com/maps/api/geocode/json?' + search, function(res){
    var data = ''
    
    res.on('data', function(newData){
      data += newData
    });
 
   res.on('end', function(){
      var location = JSON.parse(data).results[0].geometry.location
      var options = querystring.stringify({ units: 'si', lang: 'pt' })
      https
        .get('https://api.forecast.io/forecast/aa6cad5bf1cc69a42eaac6944c604309/' + location.lat +',' + location.lng + '?' + options, function(resForecast){
          var data = ''
 
          resForecast.on('data', function(newData){
            data += newData
          });
 
          resForecast.on('end', function(){
            var json = JSON.parse(data)
            console.log('Temperatura Atual: ' + json.currently.temperature + ' �C')
            console.log('Sensa��o T�rmica: ' + json.currently.apparentTemperature + ' �C')
            console.log(json.daily.summary)

	  db.mydb.insert({TemperaturaAtual: json.currently.temperature,
			 Sensa��oT�rmica: json.currently.apparentTemperature, 
                          Time: json.daily.summary});
          })
        })
    })
  })