 /*!
 * Copyright(c) Raphael Colboc
 * MIT Licensed
 */

var Processor 	= require("./processor.js");
var events 		= require("events");
var util 		= require("util");
var mongoose 	= require('mongoose');
var attributeService 	= require('../service/attribute');

function ProductProcessor(config) {
	
	/**
	 * @see parent Processor
	 */
	Processor.call(this, config);
	
	/**
	 * @var attributes array will contains all attributes of the family with code and requirement condition
	 */
	this.attributes 		=  [];
	this.row 				= 0;
	this.familyModel 		= mongoose.model('family');
	this.attributeModel 	= mongoose.model('attribute');
}

util.inherits(ProductProcessor, Processor);

ProductProcessor.prototype.treat = function(item, last, writerCallback) {
	
	var attributes = [];
	ProductProcessor.prototype.removeAllListeners('attributes_loaded');
	
	ProductProcessor.prototype.on('attributes_loaded', function(item, attributes, familyId) {
		attributeService.validate(attributes, item, function(err, item){
			if (err.length > 0) {
				err.forEach(function(error, index){
					console.log(error) ;
				});
			} else {
				var product = {};
				product.family = familyId;
				product.sku = item.sku;
				product.normalizedData = item;
				
				var updateProduct = function(product){
					
					Processor.prototype.treat.call(this, product, last, function(doc, last){
						console.log(' Write ' + product.sku);
						writerCallback.treat(doc, last);
					});
				}.bind(this);
				
				updateProduct(product);
			}
		}.bind(this));
	}.bind(this));
	
	if (last === false) {
		this.familyModel.findOne({code:item.family}, "",function(err, family){
			
			if (typeof family._id == 'undefined') {
				console.log('family ' + item.family +' does not exist');
				return;
			}
			  
			var countAttributes = (typeof family.attributes.length === 'undefined')? 0 : family.attributes.length -1 ;
			
			// load attributes
			 if (countAttributes > 0) {
				var i = 0;
				family.attributes.forEach(function(attribute, index){
					  this.attributeModel.findById(attribute._id, function(err, attributeDoc) {
						  attributeDoc.required = attribute.required;
						  attributes.push(attributeDoc);
						 	
						  i++;
						  if (i == countAttributes){
							  ProductProcessor.prototype.emit('attributes_loaded', item, attributes, family._id);
						  }
					  });
				  }.bind(this));
			 }
			
			//console.log(JSON.stringify(doc));
		}.bind(this));
	}
	
	this.row++;
};

module.exports = ProductProcessor;