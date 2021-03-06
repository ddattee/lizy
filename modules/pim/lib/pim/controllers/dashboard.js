/*!
 * Copyright(c) Raphael Colboc
 * MIT Licensed
 */

var Controller 	= require("./controller.js");
var mongoose 	= require('mongoose');
var util 		= require("util");

function DashboardController() {
	Controller.call(this);
}

util.inherits(DashboardController, Controller);

DashboardController.controller = function(app, entity) {

	/**
   * Create route
   */
   app.get('/'+entity+'/index', function(req, res) {
	  Controller.prototype.render(res, 'pim/page/dashboard.ejs', { });
	   });  
  
}

module.exports = DashboardController;