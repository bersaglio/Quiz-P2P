var models =require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objQuizOwner = req.quiz.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objQuizOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

//Autoload - factoriza el código si ruta incluye :quizId

exports.load = function(req, res, next, quizId){
  models.Quiz.find({
      where: { id: Number(quizId)},
      include: [{ model: models.Comment }]
    }).then(function(quiz) {
      if(quiz){
        req.quiz = quiz;
        next();
      } else { next (new Error ('No existe quizId=' + quizId));}
    }
  ).catch(function(error){ next(error);});
};

//GET /quizes/new
exports.new = function(req, res){
 var quiz = models.Quiz.build(
  {pregunta: "Pregunta", respuesta: "Respuesta"}
  );

 res.render('quizes/new',{ quiz: quiz, errors: [] });
};


// POST /quizes/create
exports.create=function(req, res){
  req.body.quiz.UserId = req.session.user.id;
  if(req.files.image){
    req.body.quiz.image = req.files.image.name;
  }

  var quiz = models.Quiz.build( req.body.quiz );

  quiz.validate().then(function(err){
    if(err){
      res.render('quizes/new', {quiz: quiz, errors: err.errors, title: 'Crear'});
    }else{
      quiz
      .save({fields: ["pregunta", "respuesta", "UserId", "image"]})
      .then(function(){ res.redirect('/quizes')}) 
    }
    
  }).catch(function(error){next(error)});
};


//GET /quizes/:id
exports.show = function(req, res){
  models.Quiz.find(req.params.quizId).then(function(quiz) {
      res.render('quizes/show', { quiz: req.quiz, errors: [] });
    
  })
};	

//GET /quizes/:id/answer
exports.answer = function(req, res){
  models.Quiz.find(req.params.quizId).then(function(quiz) {
    if(req.query.respuesta === req.quiz.respuesta){
    	res.render('quizes/answer', { quiz: req.quiz, respuesta: 'Correcto', errors: []  });	
    } else{
    	res.render('quizes/answer', { quiz: req.quiz, respuesta: 'Incorrecto', errors: [] });	 	
    }
    
  })
};


// GET /quizes
exports.index = function(req, res, next){
    
    var options = {};
    if (req.user){ //Si queremos ir a mis preguntas sólo se mostrarán aquellas que pertenezcan al usuario
        options.where = {UserId: req.user.id}
    } 

    if(req.query.search){
        models.Quiz.findAll({where: ["pregunta like ?", '%'+req.query.search+'%'], order: 'pregunta'})
        .then(function(quizes){
             res.render('quizes/index.ejs', {quizes: quizes, title: 'Listado', errors: [] })}).catch(function(error) { next(error);});
            
    }else{ //
        options.include = {model: models.User, as: "Seguidores"}
        models.Quiz.findAll(options).then(function(quizes){ 
            
            
            if(req.session.user){
                quizes.forEach(function(quiz){
                    quiz.selected = quiz.Seguidores.some(function(seguidor) {
                        return seguidor.id == req.session.user.id}); 
            });}
            res.render('quizes/index.ejs', {quizes: quizes, errors: []});
        }).catch(function(error){next(error);})
    }
};

exports.edit = function(req, res){
  var quiz = req.quiz;
  res.render('quizes/edit', {quiz: quiz, errors: []});
};

exports.update = function(req,res){
  if(req.files.image){
    req.quiz.image = req.files.image.name;
 }

  req.quiz.pregunta = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz.validate().then(
    function(err){
      if(err){
        res.render('quizes/edit', {quiz:req.quiz, errors: err.errors});  
      }else{
        req.quiz.save({fields: ["pregunta", "respuesta", "image"]})
        .then(function(){res.redirect('/quizes');});
      }
    }
    );
};


//DELETE/quizes/:id
exports.destroy = function(req,res){
  console.log('ha entrado en eliminar');
  req.quiz.destroy().then( function(){
    res.redirect('/quizes');
  }).catch(function(error){next(error);});
};

//GET /author
exports.author = function(req,res){
  res.render('quizes/author', { quiz: req.quiz, errors: [] }); 

};