var models = require('../models/models.js');


var preg_conC=0;
var preg_sinC=0;
var nMedio=0;
var preguntas=0;

exports.load = function(req, res) {
	models.Quiz.findAll().then(function(quizes){	
  models.Comment.findAll().then(function(comentarios){

  		nMedio=(comentarios.length/quizes.length);
  		preg_conC=0;
			preg_sinC=0;
			
    	
  		for(var i=0; i< quizes.length; i++){
  			for(var j=0; j< comentarios.length; j++){
    		
    			if(comentarios[j].QuizId == quizes[i].id){
    				preg_conC++;
    				break;
    			}else{
    				preg_sinC++;
            break;
    			}
    		}	
    	
    	}	 
  		res.render('quizes/statistics', {quizes: quizes,
       nMedio: nMedio, comentarios: comentarios , preg_sinC : preg_sinC , preg_conC: preg_conC, errors: []}); 
    }).catch (function (error) { next(error)});

  }).catch (function (error) { next(error)});
};
