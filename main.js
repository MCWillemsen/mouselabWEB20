// 	main.js:  central script file to generate mlweb table from json file
//
//       v 2.00, Nov 2017
//		
//     (c) 2017 Martijn C. Willemsen and Martijn ter Meulen
//
//    This program is free software; you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation; either version 2 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program; if not, write to the Free Software
//    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA

var blurBoxes = [];
var order;
var attributeOrder = "";
var attNumericOrder = "";
var JSONData = [];
var elementIdentifier;

//default values of layout
var def = ["w3-white", "w3-center", "w3-padding-4", "w3-margin-left"]; 
var def_txt = ["w3-light-blue"];
var def_box = ["w3-indigo"];
var def_labelTxt = ["w3-white"];
var def_btnTxt = ["w3-white"];
var def_btnClass = ["w3-button", "w3-block", "w3-border", "w3-border-gray", "w3-round-xlarge"];
var def_buttonclick = "w3-blue w3-hover-blue";

var topLabels = false;
var sideLabels = false;
var bottomButtons = false;
var sideButtons = false;
var numRows = 0;
var numCols = 0;
var totalRows = 0;
var totalCols = 0;

    


//Main function to call from LimeSurvey or standalon HTML page --> jsonIdentifier is the filename, trialIdentifier is the name of the set element (trial) to call
function generateTrial(jsonUrl, trialIdentifier, orderNum){
   
   //retrieve data from json file
  var retrieveData = $.getJSON(jsonUrl); 
  set = trialIdentifier;  
    retrieveData.done(function(JSONdata){
        interpreter(JSONdata, trialIdentifier, orderNum);
    })
    
}

//Main function calling all subfunctions
function interpreter(dataInput, setInput, orderNum){
    json=dataInput;
	var setData = [];
    
    dataInput["sets"].forEach(function(item){
        if (item["name"] == setInput){
            setData = item;
        };
    });
    
    //insert the basic structure (columns and rows)
    var orderData = dataInput["optOrders"];
    var optionData = dataInput["options"];
    insertStructure(setData, orderData, optionData, orderNum);
    
    //insert stimuli/text in the boxes
    insertStimuli(setData, optionData);
    
    
    //insert styling (width, blur, closed boxes, classes etc.)
    var styleInput = dataInput["cells"];
    insertStyles(setData, styleInput, optionData, orderData);
    
    //put all added variables, including condition number, in hidden input fields
    fillAddedVariables(setData);
    
   	}



//Main function for displaying the structure (rows and columns
function insertStructure(dataInput, orderInput, optionInput, orderNum){
    //retrieve the order and resolve random is necessary
    if(orderNum == "random"){
        orderNum = getRandom(0, (dataInput["optOrder"].length-1));
    }
    //otherwise take modulo of orderNum
	var orderID = dataInput["optOrder"][orderNum%dataInput["optOrder"].length];
    
    orderInput.forEach(function(item){
        if(item["name"] == orderID){
            order = item["items"];
        }
    });
    
    //call the main structural functions
    insertRows(dataInput, orderInput, optionInput);
    insertColumns(dataInput, orderInput, optionInput);
}



function getRandom(min, max){
     return Math.floor(Math.random()*(max-min+1)+min);
}




function convertToNumeric(inputArray, outputArray){
    for (var items in inputArray){
        outputArray.push(inputArray[items]);
    }
}




//insert rows and define strucural elements (number of rows and number of columns for the inversed stimuli alignment)
function insertRows(dataInput, orderInput, optionInput, btnInput){
    var numOptions = order.length;
    var rowCounter = 0;
    var rowArray;
     
    for(i=0; i<numOptions; i++){ //drie keer voor iedere optie
        var currentOption = order[i];
                  
        optionInput.forEach(function(item){
            if(item["name"] == currentOption){
                rowArray = item["attributes"];
                
                if(dataInput["layout"] == "attributeCol"){
                    totalRows = totalRows + (rowArray.length);
                    if((dataInput['displayLabels'] == "all" || dataInput['displayLabels'] == "attOnly") && i==0){
                        topLabels = true;
                    }
                    
                }else{
                    for(n=0; n<rowArray.length; n++){
                        if(rowArray[n]["txt"].length > numRows){
                            totalRows = rowArray[n]["txt"].length;
                        }  
                    }
                    if((dataInput['displayLabels'] == "all" || dataInput['displayLabels'] == "optOnly") && i==0){
                        topLabels = true;
                    }
                }
            }
        });
    }
        
    for(j=0; j<totalRows; j++){
        rowCounter++;
                      
        if(topLabels == true && j == 0){
            $("#container").append("<div id='headerLabels' class='w3-row w3-white'></div>");
        }
        $("#container").append("<div id='row" + (rowCounter) + "' class='w3-row w3-white'></div>");
    }

    if(dataInput["buttons"] == "on"){    
        if(dataInput["layout"] == "optionCol"){
            bottomButtons = true;
            $("#container").append("<div id='buttons' class='w3-row w3-white'></div>");
        }else{
            sideButtons = true;
        }
    }
}



//Insert columns
function insertColumns(dataInput, orderInput, optionInput){
    var numOptions = order.length;
    var rowCounter = 0;
    var colCounter = 0;
    var colConstraint = 0;
    var optionCounter = 0;
    var topLabelCounter = 0;
    var numTopLabels = 0;
    
    for(i=0; i<numOptions; i++){ 
        var currentOption = order[i];
        
        optionInput.forEach(function(item){
            if(item["name"] == currentOption){
                var colArray = item["attributes"];
                colCounter = 0;
				
                if(dataInput["layout"] == "attributeCol"){
                    numRows = item["attributes"].length;
                }else{
                    numRows = totalRows;
                    numTopLabels = (topLabelCounter + item["attributes"].length);
                }
                
                for(j=0; j<numRows; j++){
                    
                    if(dataInput["layout"]=="attributeCol"){
                        numCols = colArray[j]["txt"].length;
                        rowCounter++;
                        var sideLabelIdentifier = item["attributes"][j]["label"];
                    }else{
                        numCols = colArray.length;
						rowCounter = (j+1);
                        var sideLabelIdentifier = item["attributeLabels"][j];
                    }
                    
                    for(k=0; k < numCols; k++){
                        colCounter++;
                        if(dataInput["layout"]=="attributeCol"){
                            var colSelector = colCounter;
                        }else{
                            var colSelector = rowCounter;
                            if(j >= colSelector){
                                colSelector++;
                            }
                            if(k > 0){
                                colSelector = (colSelector+totalRows);
                            }
                        }
                       
                        if(topLabels == true && j==0 && ((dataInput["layout"] == "optionCol" && topLabelCounter < numTopLabels) || (dataInput["layout"] == "attributeCol" && i == 0))){
                            topLabelCounter++;
                            $("#headerLabels").append('<div id="headerLabel' + (topLabelCounter) + '" class="headerElement w3-col"></div>');
                            $("#headerLabel" + (topLabelCounter)).append('<div id="headerLabel' + (topLabelCounter) + '_txt" class="headerTxt w3-display-container"></div>');
                        }
                        
						$("#row" + rowCounter).append('<div id="' + currentOption + (colSelector) + '" class="colElement w3-col"></div>');
                        $("#" + currentOption + (colSelector)).append('<div id="' + currentOption + (colSelector) + '_txt" class="w3-display-container textBox"></div>');
                        $("#" + currentOption + (colSelector)).append('<div id="' + currentOption + (colSelector) + '_box" class="w3-display-container mask"></div>');   
                    }
                       
                   
                   //insert sidelabels
                    if((dataInput["layout"] == "attributeCol" && (dataInput["displayLabels"] == "optOnly" || dataInput["displayLabels"] == "all")) || (dataInput["layout"] == "optionCol" && (dataInput["displayLabels"] == "attOnly" || dataInput["displayLabels"] == "all") && i ==0)){
                        sideLabels = true;
                        $("#row" + (rowCounter)).prepend('<div id="sideLabel' + (rowCounter) + '" class="sideElement w3-col"></div>');
                        $("#sideLabel" + (rowCounter)).append('<div id="sideLabel' + (rowCounter) + '_txt" class=" sideTxt w3-display-container"></div>');
                    }                    
                    if(sideLabels == true && i == 0 && j == 0){
                        $("#headerLabels").prepend('<div id="headerLabel0" class="headerElement w3-col"></div>');
                        $("#headerLabel0").append('<div id="headerLabel0_txt" class="headerTxt w3-display-container"></div>');
                    }
                }
            }
        });
        if(bottomButtons==true){
            if(sideLabels == true && i==0){
                $("#buttons").append('<div id="button0" class="buttonCell w3-col"></div>');
                $("#button0").append('<div id="button0_txt" class="buttonTxt w3-display-container"></div>');
            }
            $("#buttons").append('<div id="button' + currentOption + '" class="buttonCell w3-col"></div>');
            $("#button" + (currentOption)).append('<div id="button' + (currentOption) + '_txt" class="buttonTxt w3-display-container"></div>');

            if(numCols > 1 && dataInput["layout"] == "optionCol"){
                for(q = 1; q < numCols; q++){
                    $("#buttons").append('<div class="buttonCell w3-col buttonSpace"></div>');
                }
                
            }
        }  
    }
    if(sideButtons == true){
        var rowBtnCounter = 0;
        for(l = 0; l < (order.length); l++){
            rowBtnCounter++;
            $("#row" + (rowBtnCounter)).append('<div id="button' + order[l] + '" class="buttonCell w3-col"></div>');
            $("#button" + order[l]).append('<div id="button' + order[l] + '_txt" class=" buttonTxt w3-display-container"></div>');
            optionInput.forEach(function(object){
                if((object["name"] == order[l]) && (object["attributes"].length > 1) && (dataInput["layout"] == "attributeCol")){
                    for(m=1; m<object["attributes"].length; m++){
                        rowBtnCounter++;
                          $("#row" + (rowBtnCounter)).append('<div class="buttonCell w3-col buttonSpace"></div>');
                    }
                }
            })
        }
    }
    $(".buttonSpace").append('<div class="buttonTxt w3-display-container"></div>');
}



//insert stimuli in the boxes
function insertStimuli(dataInput, optionInput, btnInput){
    var randomTxtArray = [];
    var workingArray = [];
    var txtNumber;
    var txtSelector;
	var varSelector;
	var boxLabelSelector;
   var sideLabelCounter = 0;
   
    
    for(i = 0; i < order.length; i++){
            
        optionInput.forEach(function(item){
                
            if(item["name"] == order[i]){
                var cellCounter = 0;
                
                if(i==0 && dataInput["attOrder"]=="random"){
                    for(h=0; h<(item["attributes"][0]["txt"]).length; h++){
                        workingArray.push(h);
                    }
                    randomTxtArray = shuffle(workingArray);
                }
                
                for(j=0; j<(item["attributes"].length); j++){
                    
                    sideLabelCounter++;
                    
                    for(k=0; k<(item["attributes"][j]["txt"]).length; k++){
                        cellCounter++;
                        
                        if(dataInput["attOrder"]=="standard"){
                            txtNumber = k;
                            txtSelector = (item["attributes"][j]["txt"][k]);
                            boxLabelSelector = (item["attributes"][j]["box"][k]);
							varSelector = (item["attributes"][j]["var"][k]);
							
                        }else if(dataInput["attOrder"] == "reverse"){
                            txtNumber = ((item["attributes"][j]["txt"].length)-(k+1));
                            txtSelector = (item["attributes"][j]["txt"][txtNumber]);
                            boxLabelSelector = (item["attributes"][j]["box"][txtNumber]);
							varSelector = (item["attributes"][j]["var"][txtNumber]);
							
                        }else{
                            txtNumber = (randomTxtArray[k]);
                            txtSelector = item["attributes"][j]["txt"][txtNumber];
                            boxLabelSelector = (item["attributes"][j]["box"][txtNumber]);
							varSelector = (item["attributes"][j]["var"][txtNumber]);
                        }
                            if(i == 0 && j == 0){
                                if(attributeOrder != ""){
                                    attributeOrder += "/";
                                    attNumericOrder += "/";
                                }
                                attributeOrder += item["attributeLabels"][txtNumber];
                                attNumericOrder += txtNumber;
                            }
                     
                        
                        $("#" + order[i] + (cellCounter)).attr("name",varSelector);
                        $("#" + order[i] + (cellCounter) + "_txt").append('<div class="w3-display-middle"><p>' + txtSelector + '</p></div>');
                        $("#" + order[i] + (cellCounter) + "_box").append('<div class="w3-display-middle"><p>' + boxLabelSelector + '</p></div>');
                    
                        if(i == 0){
                            if(dataInput["displayLabels"] == "attOnly" || dataInput["displayLabels"] == "all"){
                                if(dataInput["layout"] == "attributeCol"){
                                    $("#headerLabel" + (cellCounter) + "_txt").append('<div class="w3-display-middle"><p>' + item["attributeLabels"][txtNumber] + '</p></div>');
                                }else{
                                    $("#sideLabel" + (cellCounter) + "_txt").append('<div class="w3-display-middle"><p>' + item["attributeLabels"][txtNumber] + '</p></div>');
                                }
                            }
                        }
                    }
                    
                    if(dataInput["displayLabels"] == "optOnly" || dataInput["displayLabels"] == "all"){
                        if(dataInput["layout"] == "attributeCol"){
                            $("#sideLabel" + (sideLabelCounter) + "_txt").append('<div class="w3-display-middle"><p>' + item["attributes"][j]["label"] + '</p></div>');
                        }else{
                            $("#headerLabel" + (sideLabelCounter) + "_txt").append('<div class="w3-display-middle"><p>' + item["attributes"][j]["label"] + '</p></div>');
                        }
                    }    
                }
                $("#button" + item["name"] + "_txt").append('<button type="button" class="choiceButton" id="' + item["optionName"] + '" name="choice" value="' + item["optionName"] + '">' + item["optionName"] + '</button>'); 
                
            }
        });
    }
}






function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle
  while (0 !== currentIndex) {

    // Pick a remaining element
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}



function insertStyles(dataInput, styleInput, optionInput, orderInput){
    
    if(dataInput["styling"] == "uniform"){
        var styling = dataInput["cellFormat"][0];
        //set width and height
        styleInput.forEach(function(item){
            if(item["name"] == styling["cellType"]){
                $(".colElement").css("width", item["width"]);
                $(".mask").css("height", item["height"]);
                $(".textBox").css("height", item["height"]);
                
                if(topLabels == true || sideLabels == true){
                    labelStyles("uniform", item["width"], item["height"]);
                }
                buttonStyles("uniform", item["width"], item["height"], optionInput);
           
            //check for default classes
             if(item["mainClass"] != "default"){
                 def = item["mainClass"];
             }
             if(item["txtClass"] != "default"){
                 def_txt = item["txtClass"];
             }
             if(item["boxClass"] != "default"){
                 def_box = item["boxClass"];
             }
             if(item["labelClass"] != "default"){
                 def_labelTxt = item["labelClass"];
             }
        }
        });
        
        //add the classes
        assignClasses(def, "colElement", "class");
        assignClasses(def_txt, "textBox", "class");
        assignClasses(def_box, "mask", "class");
       
        //set display for boxtypes
           if(styling["boxType"] == "closed"){
                $(".textBox").css("display", "none");
            }else{
               $(".mask").css("display", "none");
            }
            if(styling["boxType"] == "blur"){
                blurBoxes.push(".textBox");
                $(".mask").remove();
            }
            if(styling["boxType"] != "open"){
                $(".colElement").addClass("Hoverable")
            }
            
    }else{
        var styleArr = [];
       var styling = dataInput["cellFormat"];
       var rowCounter = 1;
       var structuralStyling = "";
       
       if((dataInput["styling"] == "byOpt" && dataInput["layout"] == "optionCol") || (dataInput["styling"] == "byAtt" && dataInput["layout"] == "attributeCol") ){
           structuralStyling = "byCol";

       }else{
           structuralStyling = "byRow";
                      
           var numberOfCols = $("#row1").children().length;
       }
       for(k = 0; k < styling.length; k++){
           
            var styleSelector = k;
            var index = "";
            if(dataInput["styleStructure"][0] == "fixAttributes"){
                if(dataInput["styling"] == "byAtt"){
                    switch(dataInput["attOrder"]){
                        case "reverse":
                            var numStyles = (styling.length-1);
                            styleSelector = numStyles - k;
                            break;
                        case "random":
                            var splitAtts = attNumericOrder.split("/");
                            styleSelector = splitAtts[k];
                            break;
                    }
                }
            }else if(dataInput["styleStructure"][0] != "independent"){
                if(k < order.length){
                    var currentOption = order[k];
                    var currentStyle = dataInput["styleStructure"][0][currentOption];
                    styleSelector = currentStyle;
                }
            }
            styleArr.push(styleSelector);

           var currentCell = styling[styleSelector]["cellType"]; //either specifying celltype for column or row
           var currentBox = styling[styleSelector]["boxType"];
           //set width and height for column based different boxes
           styleInput.forEach(function(item){

                if(item["name"] == currentCell){
                    //check for default classes for this column
                    if(item["mainClass"] != "default"){
                        def = item["mainClass"];
                    }else{
                        def = ["w3-white", "w3-center", "w3-padding-4", "w3-margin-left"]; 
                    }
                    if(item["txtClass"] != "default"){
                        def_txt = item["txtClass"];
                    }else{
                        def_txt = ["w3-light-blue"];
                    }
                    if(item["boxClass"] != "default"){
                        def_box = item["boxClass"];
                    }else{
                        def_box = ["w3-indigo"];
                    }
                    if(item["labelClass"] != "default"){
                        def_labelTxt = item["labelClass"];
                    }else{
                        def_labelTxt = ["w3-white"];
                    }
                    //check if styling is by column, row or both
                    if(structuralStyling == "byRow"){
                        var cellIdentifier = numberOfCols;
                        
                    }else if(structuralStyling == "byCol"){
                        var cellIdentifier = totalRows;
                    }
                    
                    for(h = 0; h < cellIdentifier; h++){
                       
                       var childSelector;
                       
                        if(structuralStyling == "byRow"){
                            childSelector = h;
                        }else if(structuralStyling == "byCol"){
                            childSelector = k;
                        }
                        if(sideLabels == true){
                            childSelector = childSelector + 1;
                        }
                        
                       if(structuralStyling == "byRow"){
                            var selector = $("#row" + (k+1)).children().eq(childSelector).attr("id");
                           // console.log(selector);
                        }else if(structuralStyling == "byCol"){
                            var selector = $("#row" + (h+1)).children().eq(childSelector).attr("id");
                            //console.log(selector);
                        }
                        
                        var box = selector + "_box";
                        var txt = selector + "_txt";
                        
                        $("#" + selector).css("width", item["width"]);
                        $("#" + selector).children().css("height", item["height"]);
                        
                        //add classes to the items in this column
                        assignClasses(def, selector, "id");
                        assignClasses(def_txt, txt, "id");
                        assignClasses(def_box, box, "id");
                        
                        labelStyles(structuralStyling, item["width"], item["height"], (k+1), rowCounter);
                        
                       var ifButton = $("#" + selector).hasClass("buttonCell");
                        if(ifButton == false){
                            //set display for boxtypes in this column
                            if(currentBox == "closed"){
                                $("#" + txt).css("display", "none");
                            }else{
                                $("#" + box).css("display", "none");
                            }

                            if(currentBox == "blur"){
                                blurBoxes.push(txt);
                                $("#" + box).remove();
                            }
                            if(currentBox != "open"){
                                $("#" + selector).addClass("Hoverable");
                            }
                        }
                    }
                }
           })
       } 
       buttonStyles(structuralStyling, "null", "null", styleInput, styling, styleArr);
    }
}



function labelStyles(layoutType, width, height, rowColNumber, rowCounter, newRow){
    if(layoutType == "uniform"){
            $(".headerElement").css("width", width);
            $(".headerTxt").css("height", height);
            $(".sideElement").css("width", width);
            $(".sideTxt").css("height", height);
            
            assignClasses(def, "headerElement", "class");
            assignClasses(def_labelTxt, "headerTxt", "class");
            assignClasses(def, "sideElement", "class");
            assignClasses(def_labelTxt, "sideTxt", "class");
    }
    if(layoutType == "byRow"){
        if(rowColNumber == 1){
            $(".headerElement").css("width", width);
            $(".headerTxt").css("height", height);
            
            assignClasses(def, "headerElement", "class");
            assignClasses(def_labelTxt, "headerTxt", "class");
        }

        $("#sideLabel" + rowColNumber).css("width", width);
        $("#sideLabel" + rowColNumber + "_txt").css("height", height);
            
        assignClasses(def, ("sideLabel" + rowColNumber), "id");
        assignClasses(def_labelTxt, ("sideLabel" + rowColNumber + "_txt"), "id");
    }
    
    if(layoutType == "byCol"){
        //console.log(rowColNumber);
        if(topLabels == true){
            if(rowColNumber == 1){
                $("#headerLabel0").css("width", width);
                $("headerLabel0_txt").css("height", height);
                
                assignClasses(def, "headerLabel0", "id");
                assignClasses(def_labelTxt, "headerLabel0_txt", "id");
            }
            
            $("#headerLabel" + rowColNumber).css("width", width);
            $("#headerLabel" + rowColNumber + "_txt").css("height", height);
            
            assignClasses(def, ("headerLabel" + rowColNumber), "id");
            assignClasses(def_labelTxt, ("headerLabel" + rowColNumber + "_txt"), "id");
        }
        if(sideLabels == true && rowColNumber == 1){
            $(".sideElement").css("width", width);
            $(".sideTxt").css("height", height);
            
            assignClasses(def, "sideElement", "class");
            assignClasses(def_labelTxt, "sideTxt", "class");
        }
    }
}



function buttonStyles(layoutType, width, height, styleInput, styling, styleArr){
    if(layoutType == "uniform"){
        $(".buttonCell").css("width", width);
        $(".buttonTxt").css("height", height);
  
    }else if(layoutType == "byRow"){
        var countRows = $("#container").children().length;
        if(topLabels == true){
            countRows--;
        }
        if(bottomButtons == true){
            countRows--;
        }
        for(i=0; i<countRows; i++){
            var styleNameID = styleArr[i];
            var styleName = styling[styleNameID]["cellType"];

            styleInput.forEach(function(item){
                if(item["name"] == styleName){
                    if(sideButtons == true || i==(countRows-1)){
                        var width = item["width"];
                        var height = item["height"];
                        if(sideButtons == true){
                            $("#row" + (i+1)).children(".buttonCell").css("width", item["width"]);
                            $("#row" + (i+1)).children(".buttonTxt").css("height", item["height"]);
                        }else{
                            $(".buttonCell").css("width", item["width"]);
                            $(".buttonTxt").css("height", item["height"]);
                        }
                    }
                }
            });
        }
    }else{
        var countCols = $("#row1").children().length;
        if(sideLabels == true){
            countCols--;
        }
        if(sideButtons == true){
            countCols--;
        }
        for(i=0; i<countCols; i++){
            
             var styleNameID = styleArr[i];
             
            var styleName = styling[styleNameID]["cellType"];
           
            styleInput.forEach(function(item){
                if(item["name"] == styleName){
                    var width = item["width"];
                    var height = item["height"];
                    if(bottomButtons == true || i == (countCols-1)){
                        if(bottomButtons == true){
                            if(i==0){
                                if(sideLabels == true){
                                    $("#button0").css("width", item["width"]);
                                }
                                $(".buttonTxt").css("height", item["height"]);
                            }
                            if(sideLabels == true){
                                $("#buttons").children().eq(i+1).css("width", item["width"]);
                            }else{
                                $("#buttons").children().eq(i).css("width", item["width"]);
                            }
                        }else{
                            var countRows = $("#container").children().length;
                            if(topLabels == true){
                                countRows--;
                            }
                            for(j=0; j<countRows; j++){
                                $("#row" + (j+1)).children(".buttonCell").css("width", item["width"]);
                            }
                        }
                    }
                }
            });
        } 
    }
    assignClasses(def, ("buttonCell"), "class");
    assignClasses(def_btnTxt, ("buttonTxt"), "class");
    assignClasses(def_btnClass, ("choiceButton"), "class");   
}



function assignClasses(classInput, divElement, elementType){
    for(j=0; j < classInput.length; j++){
        if(elementType == "id"){
            $("#" + divElement).addClass(classInput[j]);
        }else{
            $("." + divElement).addClass(classInput[j]);
        }    
    }
}



//add all the extra variables as a hidden input
function fillAddedVariables(dataInput){
    var varsToAdd = dataInput["addedVars"];
    
    for(i=0; i<varsToAdd.length; i++){
        var splitVar = varsToAdd[i].split("=");
        if(splitVar[0] == "condNum"){
            $("#condInput").val(splitVar[1]);
        }else{
            $("#mlwebform").append('<input type=hidden name="' + splitVar[0] + '" value="' + splitVar[1] + '">');
        }
    }
    
    var orderString = "";
    
    for(j=0; j < order.length; j++){
        if(j==0){
            orderString = order[j];
        }else{
            orderString = orderString + "-" + order[j];
        }   
    }
    $("#mlwebform").append('<input type=hidden name="optionOrder" value="' + orderString + '">');
    $("#mlwebform").append('<input type=hidden name="attributeOrder" value="' + attributeOrder + '">');
	$("#mlwebform").append('<input type=hidden name="set" value="' + set + '">');
	
}


