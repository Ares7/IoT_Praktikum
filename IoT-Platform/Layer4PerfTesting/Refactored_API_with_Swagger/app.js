'use strict';

var path = require('path');
var SwaggerExpress = require('swagger-express-mw');
var swStats = require('swagger-stats');  
var app = require('express')();
var swaggerUi = require('swagger-ui-express');

var specLocation = path.join(__dirname, 'swagger.json');
var apiSpec = require(specLocation);

module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function (err, swaggerExpress) {
  if (err) { throw err; }

  app.use(swStats.getMiddleware({swaggerSpec:apiSpec}));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiSpec));

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 10010;
  app.listen(port);

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});
