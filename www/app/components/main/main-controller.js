"use strict";

angular.module("ngapp").controller("MainController", function(shared, $state, $scope, $mdSidenav, $mdComponentRegistry){

    var ctrl = this;

    this.auth = shared.info.auth;

    this.toggle = angular.noop;

    this.title = $state.current.title;


    this.cropImage= "";
    $scope.recognizedText="";
    $scope.englishText="";
    $scope.transliteratedText="";
    this.isOpen = function() { return false };
    $mdComponentRegistry
    .when("left")
    .then( function(sideNav){
      ctrl.isOpen = angular.bind( sideNav, sideNav.isOpen );
      ctrl.toggle = angular.bind( sideNav, sideNav.toggle );
    });

    this.toggleRight = function() {
    $mdSidenav("left").toggle()
        .then(function(){
        });
    };

    this.takePicture = function(){
        navigator.camera.getPicture($scope.onPhotoSuccess, this.onFail, {
           quality:100, 
            destinationType: navigator.camera.DestinationType.FILE_URI
           
            
            
        });
    }
    
    $scope.onPhotoSuccess = function(croppedURI){

         $scope.$apply(function(){
                $scope.cropImage= croppedURI;
             alert(croppedURI);
               var options = new FileUploadOptions();
     options.fileKey = "myfile";
     options.fileName = "image.jpg";
     options.mimeType = "image/jpeg";
     console.log(options.fileName);
     var params = new Object();
     params.sourcelang = "tam";
        params.tolang="hin"       

     options.params = params;
     options.chunkedMode = false;

    var ft = new FileTransfer();
     ft.upload(croppedURI, "http://192.168.1.9:8081/india", function(result){
      $scope.updateResult(result.response);
     }, function(error){
    alert(JSON.stringify(error));
     }, options);
       });
       
       // $scope.cropSuccess(photoUri);
          //  alert(photoUri);
            //plugins.crop($scope.cropSuccess, function fail(message){ alert(message);}, photoUri);
        }
    this.onFail = function(message){
        
        alert(message);
    }
    
    $scope.updateResult = function(response){
        $scope.$apply(function(){
             alert(JSON.stringify(response));
           
         
         $scope.recognizedText = response.recognizedText;
         $scope.englishText= respose.englishTransliteration;
         $scope.transliteratedText=response.tranliteratedTo;
         });
    }
    
    $scope.cropSuccess= function(croppedURI){
       $scope.$apply(function(){
                $scope.cropImage= croppedURI;
             alert(croppedURI);
               var options = new FileUploadOptions();
     options.fileKey = "myfile";
     options.fileName = "image.jpg";
     options.mimeType = "image/jpeg";
     console.log(options.fileName);
     var params = new Object();
     params.sourcelang = "tam";
        params.tolang="hin"       

     options.params = params;
     options.chunkedMode = false;

    var ft = new FileTransfer();
     ft.upload(croppedURI, "http://192.168.1.9:8081/india", function(result){
       
         $scope.$apply(function(){
             
             var response = result.response;
         
         $scope.recognizedText = response.recognizedText;
         $scope.englishText= respose.englishTransliteration;
         $scope.transliteratedText=response.tranliteratedTo;
         });
         
     }, function(error){
    alert(JSON.stringify(error));
     }, options);
       });
       
        
    }
    this.cropFail = function(message){
        alert("Crop Failed");
    }
    this.close = function() {
    $mdSidenav("right").close()
        .then(function(){
        });
    };
});
