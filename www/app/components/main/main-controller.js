"use strict";

angular.module("ngapp").controller("MainController", function(shared,$mdDialog, $state, $http,$scope, $mdSidenav, $mdComponentRegistry,$cookies, $sce){

    var ctrl = this;

    this.auth = shared.info.auth;

    this.toggle = angular.noop;

    this.title = $state.current.title;

    this.languages= ["Bengali","English","Gujarati","Hindi","Kannada","Malayalam","Oriya","Punjabi","Tamil","Telugu"];

    this.engines =["tesseract","scribo"];

    $scope.targetengine = "tesseract";

    $scope.results = [];

    $scope.ocrengines = ["tesseract","scribo"];
    $scope.ocrops = ["normal","invert","binarize"];
    $scope.ocrenginecount = -1;
    $scope.opscount = -1;

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

    this.takePicture = function(photoType){
        if(photoType == 1){
            navigator.camera.getPicture($scope.onPhotoSuccess, this.onFail, {
                quality:100, 
                destinationType: navigator.camera.DestinationType.FILE_URI,
                saveToPhotoAlbum: true

            });
        }else{
            navigator.camera.getPicture($scope.onPhotoSuccess, this.onFail, {
                quality:100, 
                destinationType: navigator.camera.DestinationType.FILE_URI,
                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
            });
        }
    }


    $scope.setDefault=function(){
        $scope.serveraddress = "35.164.84.230:8081";
    }


    $scope.sendRetry = function(operation){


        $scope.showPic = true;
        $scope.fetch=true;
        $scope.recognizedText ="";
        $scope.englishText="";
        $scope.transliteratedText="";
        $cookies.put("sourcelang", $scope.sourcelang); 
        $cookies.put("targetlang", $scope.targetlang);
        $cookies.put("serveraddress",$scope.serveraddress);
        var options = new FileUploadOptions();
        options.fileKey = "myfile";
        options.fileName = "image.jpg";
        options.mimeType = "image/jpeg";

        var params = new Object();
        params.sourcelang = $scope.codes[$scope.sourcelang];
        params.tolang=$scope.codes[$scope.targetlang];       

        options.params = params;
        options.chunkedMode = false;

        var ft = new FileTransfer();

        ft.upload( $scope.cropImage, "http://"+$scope.serveraddress+"/india", function(result){
            $scope.updateResult(result.response);
        }, function(error){
            alert("Could not contact the service!!");
            console.log(JSON.stringify(error));
            $scope.fetch = false;
        }, options);
    }


    $scope.showTransliteration = function(index){

        $mdDialog.show(
            $mdDialog.alert()
            .title($scope.results[index].recognizedText)
            .htmlContent($sce.trustAsHtml( "<p class=\"md-headline\">"+ $scope.results[index].englishTransliteration + "</p> <p class=\"md-headline\">" + $scope.results[index].tranliteratedTo +"</p>"))
            .ariaLabel($scope.results[index].recognizedText)
            .ok('OK')

        );

    };


    $scope.onPhotoSuccess = function(croppedURI){

        plugins.crop($scope.cropSuccess, function fail(message){ alert("Crop cancelled");}, croppedURI);
    }
    this.onFail = function(message){


    }


    $scope.getStrings = function(){
        $scope.opscount++;

        if($scope.ocrenginecount == -1 || $scope.opscount >= $scope.ocrops.length){
            $scope.ocrenginecount++;
            $scope.opscount = 0;
        }
        if($scope.ocrenginecount >= $scope.ocrengines.length)
        {
            $scope.fetch=false;
            return;
        }
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
        data.operation =$scope.ocrops[$scope.opscount];
        data.filePath = $scope.filePath;
        data.engine=$scope.ocrengines[$scope.ocrenginecount];

        $http.post("http://"+$scope.serveraddress+"/indiastring", data, config)
            .success(function (data, status, headers, config) {

            if(data.recognizedText)
                $scope.results.push(data);

            console.log(JSON.stringify($scope.results));

            $scope.getStrings();


        })
            .error(function (data, status, header, config) {
            $scope.ResponseDetails = "Data: " + data +
                "<hr />status: " + status +
                "<hr />headers: " + header +
                "<hr />config: " + config;
            callback($scope.ResponseDetails,"NotDone");
        });
    }


    $scope.updateResult = function(response){
        $scope.$apply(function(){

            $scope.fetch=false;
            var response1 = JSON.parse(response)
            $scope.recognizedText = response1.recognizedText;
            $scope.englishText= response1.englishTransliteration;
            $scope.transliteratedText=response1.tranliteratedTo;
            $scope.filePath = response1.filePath;

            $scope.ocrenginecount = -1;
            $scope.opscount = -1;
            $scope.results = [];

            $scope.getStrings();


        });

    }

    $scope.cropSuccess= function(croppedURI){


        window.resolveLocalFileSystemURL(croppedURI, function (fileEntry) {
            window.cordova.plugins.imagesaver.saveImageToGallery(fileEntry.toURL(), 

                                                                 function(){console.log("Cropped Image saved");},
                                                                 function(error){console.log("Cropped Image could not be saved " + error);});
        }, function (fileName, e) {console.log("Something errored!!")});

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
            alert("Could not contact the service!!");
            console.log(JSON.stringify(error));
            $scope.fetch = false;
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
