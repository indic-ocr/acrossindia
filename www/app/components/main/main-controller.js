"use strict";

angular.module("ngapp").controller("MainController", function(shared, $state, $scope, $mdSidenav, $mdComponentRegistry,$cookies){

    var ctrl = this;

    this.auth = shared.info.auth;

    this.toggle = angular.noop;

    this.title = $state.current.title;

    this.languages= ["Bengali","English","Gujarati","Hindi","Kannada","Malayalam","Oriya","Punjabi","Tamil","Telugu"];

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

    $scope.codes={"Bengali":"ben",
                  "English":"eng",
                  Gujarati:"guj",
                  "Hindi":"hin",
                  "Kannada":"kan",
                  "Malayalam":"mal",
                  "Oriya":"ori",
                  "Punjabi":"pan",
                  "Tamil":"tam",
                  "Telugu":"tel"};


    this.cropImage= "";
    $scope.fetch = false;


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
        var options = new FileUploadOptions();
        alert($scope.sourcelang + " " + $scope.targetlang + " " + $scope.codes[$scope.sourcelang] + " " + $scope.codes[$scope.targetlang]);
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
        $scope.$apply(function(){
            $scope.cropImage= croppedURI;


            $scope.showPic = true;
            $scope.fetch=true;
            $scope.recognizedText ="";
            $scope.englishText="";
            $scope.transliteratedText="";

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
            //    alert(JSON.stringify(response));
            $scope.fetch=false;
            var response1 = JSON.parse(response)
            $scope.recognizedText = response1.recognizedText;
            $scope.englishText= response1.englishTransliteration;
            $scope.transliteratedText=response1.tranliteratedTo;
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
            ft.upload(croppedURI, "http://192.168.1.6:8081/india", function(result){

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
