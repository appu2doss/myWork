(function () {
    'use strict';

    var app = angular.module('home');

    app.controller('homeCtrl', ['$scope','$state','$filter',  function ($scope, $state, $filter) {
                  
            // DRAWING
            var mousePressed = false;
            var lastX, lastY;
            var ctx;
            var ctxb;

            var canvasWidth = 450;
            var canvasHeight = 350;

            // variables used to get mouse position on the canvas
            var $canvas = $("#drawingAppCanvas");
            var canvasOffset = $canvas.offset();
            var offsetX = canvasOffset.left;
            var offsetY = canvasOffset.top;
            var scrollX = $canvas.scrollLeft();
            var scrollY = $canvas.scrollTop();

            // variables to save last mouse position
            // used to see how far the user dragged the mouse
            // and then move the text by that distance
            var startX;
            var startY;

            var xPos = 0;
            var yPos = 0;

            // an array to hold text objects
            var texts = [];

            // this var will hold the index of the hit-selected text
            var selectedText = -1;
            var mode = "tools";

            $("#eraser").click(function () {
                mode = "eraser";
            });

            var pushObjArray = new Array();
            var cStep = -1;

            var drawingCanvas = document.getElementById('drawingAppCanvas');
            ctx = document.getElementById('drawingAppCanvas').getContext('2d');

            var backgroundCanvas = document.getElementById('drawingAppCanvasBackground');
            ctxb = document.getElementById('drawingAppCanvasBackground').getContext('2d');

            var canvas = document.getElementById("canvas");
            //    var ctx = canvas.getContext("2d");

            // Component Cast Starts
            $scope.display = "Testing for App.";
            var componentId = 11;
            $scope.$on('component-cast'+componentId, function(event, args){
                $scope.componentId = componentId;
                if (args.componentUpdatedData != undefined && args.componentUpdatedData != null) {
                    var dentalCastBase64 = args.componentUpdatedData.model;
                    var canvasPic = new Image();
                    canvasPic.src = dentalCastBase64;
                    canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); }
                }
            });

            $scope.updateComponent = function(model, tab){
                var canvasPic = new Image();
                canvasPic.src = model;
                canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); }
            };

            $scope.updateComponentChanges = function(eventObj){
                eventObj.componentId = componentId;
                eventObj.broadcastName = 'Device2PushEvent';
                $scope.$root.$broadcast('updateDeviceEvent', eventObj);
            };

            $scope.$on("Device2PushEvent"+componentId, function(event, args){
                if(args.eventType === "update"){
                    $scope.updateComponent(args.model, args.tab);
                }
            });
            
            // Canvas 1 background
            $scope.drawMissingTooth = function(arg) {
                var tempData = {};
                for(var i=0; i<arg.base.length; i++) {
                    if(arg.base[i].toolCode == "MissingCaries" || arg.base[i].toolCode == "MissingOthers" ) {
                        var toothCode = "path"+arg.base[i].toothCode;
                        tempData[toothCode]="#565656";
                    }
                }
                drawImageBg(tempData);
            }
            var tempData = {};

            drawImageBg(tempData);
            function drawImageBg(pathData) {
                var image = new Image();
                image.src = '';
                $(image).load(function () {
                    ctxb.drawImage(image, 0, 0, canvasWidth, canvasHeight);
                    ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
                    $scope.pushObj();
                });
            }

            $scope.draw = function(x, y, isDown) {
                ctx.beginPath();
                if (isDown) {
                    console.log("Modes: "+mode);
                    if(mode == "eraser") {
                        ctx.globalCompositeOperation = "destination-out";
                        ctx.arc(x, lastY, 5, 0, Math.PI * 2, false);
                        ctx.fill();
                        ctx.globalCompositeOperation = "source-over";
                    } else if(mode == "tools") {
                        ctx.globalCompositeOperation = "source-over";
                        ctx.lineJoin = "round";
                        ctx.moveTo(lastX, lastY);
                        ctx.lineTo(x, y);
                        ctx.closePath();
                        ctx.stroke();
                    }
                }
                lastX = x;
                lastY = y;

                xPos = "";
                yPos = "";
            }

            $scope.pushObj = function() {
                cStep++;
                if (cStep < pushObjArray.length) { pushObjArray.length = cStep; }
                pushObjArray.push(document.getElementById('drawingAppCanvas').toDataURL());
            }

            $scope.clearDrawing = function() {
                var canvasPic = new Image();
                canvasPic.src = pushObjArray[0];
                canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); }
            }

            $scope.undoObj = function() {
                if (cStep > 0) {
                    cStep--;
                    var canvasPic = new Image();
                    canvasPic.src = pushObjArray[cStep];
                    canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); }
                } else {
                    return false;
                }
            }
            $scope.redoObj = function() {
                if (cStep < pushObjArray.length-1) {
                    cStep++;
                    var canvasPic = new Image();
                    canvasPic.src = pushObjArray[cStep];
                    canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); }
                } else {
                    return false;
                }
            }

            $('#drawingAppCanvas').mousedown(function (e) {
                mousePressed = true;
                $scope.draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
            });

            $('#drawingAppCanvas').mousemove(function (e) {
                if (mousePressed) {
                    $scope.draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
                }
            });

            $('#drawingAppCanvas').mouseup(function (e) {
                console.log("called mouseup");
                if (mousePressed) {
                    mousePressed = false;
                    $scope.pushObj();
                    $scope.callDenalApplnBroadCast();
                }
            });

            $('#drawingAppCanvas').mouseleave(function (e) {
                console.log("called mousedown");
                if (mousePressed) {
                    mousePressed = false;
                    $scope.pushObj();
                    $scope.callDenalApplnBroadCast();

                }
            });

            $('#drawingAppCanvas').click(function (e){
                xPos = parseInt(e.offsetX);
                yPos = parseInt(e.offsetY);
                var coords = "X coords: " + xPos + ", Y coords: " + yPos;
                console.log(coords);

                var canMouseX = parseInt(e.clientX );
                var canMouseY = parseInt(e.clientY );

                console.log("Move: " + canMouseX + " / " + canMouseY);
            });


            $("#selectColor").kendoColorPicker({
                buttons: false,
                value: "#ffcc33",
                change: function() {
                    var brushColor = this.value();
                    ctx.strokeStyle = brushColor;
                    mode = "tools";
                }
            });

            $("a[name=tab]").on("click", function () {
                var a = $(this).data("index");
                console.log(a);
                ctx.strokeStyle = a;
                mode = "tools";
            });

            $("a[name=tool]").on("click", function () {
                var tool = $(this).data("index");
                console.log(tool);
                ctx.lineWidth = tool;
                mode = "tools";
            });

            $scope.callDenalApplnBroadCast = function() {
                var eventObj = {};
                eventObj.model = document.getElementById('drawingAppCanvas').toDataURL();
                eventObj.eventType = "update";
                $scope.updateComponentChanges(eventObj);

            }

            // Data URL for Download
            $scope.drawingAppCanvasDataDownload = function() {
                var ctxd = document.getElementById('drawingAppCanvasData').getContext('2d');
                var backgroundImg = document.getElementById("drawingAppCanvasBackground").toDataURL("image/png");
                var drawingImg = document.getElementById("drawingAppCanvas").toDataURL("image/png");
                var canvasPic1 = new Image();
                var canvasPic2 = new Image();
                canvasPic1.src = backgroundImg;
                canvasPic2.src = drawingImg;

                ctx.globalCompositeOperation = "source-in";
                ctxd.drawImage(canvasPic1, 0, 0);
                ctx.globalCompositeOperation = "source-over";
                ctxd.drawImage(canvasPic2, 0, 0);
                var downloadAsImg = document.getElementById("drawingAppCanvasData").toDataURL("image/png");
                return downloadAsImg;
            }
            // End Data URL for Download

            function drawText() {
                for (var i = 0; i < texts.length; i++) {
                    var text = texts[i];
                    ctx.fillText(text.text, xPos, yPos);
                }
            }

            function textHittest(x, y, textIndex) {
                var text = texts[textIndex];
                return (x >= text.x && x <= text.x + text.width && y >= text.y - text.height && y <= text.y);
            }

            $scope.handleMouseDown = function(e) {
                e.preventDefault();
                startX = parseInt(e.clientX - offsetX);
                startY = parseInt(e.clientY - offsetY);
                for (var i = 0; i < texts.length; i++) {
                    if (textHittest(startX, startY, i)) {
                        selectedText = i;
                    }
                }
            }

            ctx.fillStyle = "#cc3128";
            $("#selectTextColor").kendoColorPicker({
                palette: "basic",
                tileSize: 32,
                value: "#cc3128",
                change: function() {
                    var brushColor = this.value();
                    ctx.fillStyle = brushColor;
                }
            });

        }]);

})();