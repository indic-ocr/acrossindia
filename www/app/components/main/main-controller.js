"use strict";

angular.module("ngapp").controller("MainController", function(shared,$mdDialog, $state, $http,$scope, $mdSidenav, $mdComponentRegistry,$cookies){

    var ctrl = this;

    this.auth = shared.info.auth;

    this.toggle = angular.noop;

    this.title = $state.current.title;

    this.languages= ["Bengali","English","Gujarati","Hindi","Kannada","Malayalam","Oriya","Punjabi","Tamil","Telugu"];
    
    this.engines =["tesseract","scribo"];
    
    $scope.targetengine = "tesseract";

    if(!$cookies.get("sourcelang"))
        $scope.sourcelang= "English";
    else
        $scope.sourcelang=$cookies.get("sourcelang");
    if(!$cookies.get("targetlang"))
        $scope.targetlang= "English";
    else
        $scope.targetlang=$cookies.get("targetlang");


    if(!$cookies.get("serveraddress"))
        $scope.serveraddress = "192.168.1.6:8081";
    else
        $scope.serveraddress =$cookies.get("serveraddress");
    $scope.showPic = false;
    $scope.showInvert= false;

    $scope.codes={"Bengali":"ben",
                  "English":"eng",
                  "Gujarati":"guj",
                  "Hindi":"hin",
                  "Kannada":"kan",
                  "Malayalam":"mal",
                  "Oriya":"ori",
                  "Punjabi":"pan",
                  "Tamil":"tam",
                  "Telugu":"tel"};


    this.cropImage= "";
    $scope.fetch = false;

    $scope.filePath= "";

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

    $scope.sendRetry = function(operation){

        if(!$scope.filePath)
            return;
        $scope.showPic = true;
        $scope.fetch=true;
        $scope.recognizedText ="";
        $scope.englishText="";
        $scope.transliteratedText="";
        var config ={};
        var data = {};
        $cookies.put("sourcelang", $scope.sourcelang); 
        $cookies.put("targetlang", $scope.targetlang);
        $cookies.put("serveraddress",$scope.serveraddress);
        data.sourcelang = $scope.codes[$scope.sourcelang];
        data.tolang=$scope.codes[$scope.targetlang];   
        data.operation = operation;
        data.filePath = $scope.filePath;
        data.engine=$scope.targetengine;

        $http.post("http://"+$scope.serveraddress+"/indiastring", data, config)
            .success(function (data, status, headers, config) {

            console.log(JSON.stringify(data));
            $scope.fetch=false;

            $scope.recognizedText = data.recognizedText;
            $scope.englishText= data.englishTransliteration;
            $scope.transliteratedText=data.tranliteratedTo;


        })
            .error(function (data, status, header, config) {
            $scope.ResponseDetails = "Data: " + data +
                "<hr />status: " + status +
                "<hr />headers: " + header +
                "<hr />config: " + config;
        });
    }




    $scope.onPhotoSuccess = function(croppedURI){

        plugins.crop($scope.cropSuccess, function fail(message){ alert(message);}, croppedURI);
    }
    this.onFail = function(message){


    }

    $scope.updateResult = function(response){
        $scope.$apply(function(){
          
            $scope.fetch=false;
            var response1 = JSON.parse(response)
            $scope.recognizedText = response1.recognizedText;
            $scope.englishText= response1.englishTransliteration;
            $scope.transliteratedText=response1.tranliteratedTo;
            $scope.filePath = response1.filePath;
        });
    }

    $scope.cropSuccess= function(croppedURI){

        $scope.$apply(function(){
            $scope.cropImage= croppedURI;
            $scope.showPic = true;
            $scope.fetch=true;
            $scope.recognizedText ="";
            $scope.englishText="";
            $scope.transliteratedText="";

        });
        var options = new FileUploadOptions();



        $cookies.put("sourcelang", $scope.sourcelang); 
        $cookies.put("targetlang", $scope.targetlang);
        $cookies.put("serveraddress",$scope.serveraddress);
        options.fileKey = "myfile";
        options.fileName = "image.jpg";
        options.mimeType = "image/jpeg";

        var params = new Object();
        params.sourcelang = $scope.codes[$scope.sourcelang];
        params.tolang=$scope.codes[$scope.targetlang];       

        options.params = params;
        options.chunkedMode = false;

        var ft = new FileTransfer();

        ft.upload(croppedURI, "http://"+$scope.serveraddress+"/india", function(result){
            $scope.updateResult(result.response);
        }, function(error){
            alert(JSON.stringify(error));
        }, options);


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
