// 	main.js:  central script file to generate mlweb table from json file
//
//       v 2.1, July 2019 (more flexible JSON files)
//		
//     (c) 2019 Martijn C. Willemsen and Martijn ter Meulen
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
var orderO;
var orderA;
var orderAnum;
var attributeOrder = "";
var attNumericOrder = "";
var JSONData = [];
var elementIdentifier;
var delayMatrix = [];

//default values of layout
var def = ["w3-white", "w3-center"];  //general layout and space between boxes
var def_txt = ["w3-light-blue"]; // properties of the inside color and text in a box
var def_box = ["w3-indigo"]; // properties of the outside color and text on a box
var def_labelTxt = ["w3-white"]; // properties of the background and text color of labels
var def_btnTxt = ["w3-white"]; // properties of the background and text color of buttons
var def_btnClass = ["w3-button", "w3-block", "w3-border", "w3-border-gray", "w3-round-xlarge"]; // button type and style
var def_btnNotSel = ["w3-light-blue"]; //color of button when not selected
var def_btnSel = ["w3-blue", "w3-hover-blue"]; //color of button when selected

var topLabels = false;
var sideLabels = false;
var bottomButtons = false;
var sideButtons = false;
var numRows = 0;
var numCols =0;
var totalRows = 0;
var totalCols = 0;
var jsonFile = "";
var set = "";   


//Main function to call from LimeSurvey or standalon HTML page --> jsonIdentifier is the filename, trialIdentifier is the name of the set element (trial) to call
function generateTrial(jsonUrl, trialIdentifier, orderNum){
   //store values for datafile
   jsonFile = jsonUrl;
   set = trialIdentifier;  
   //retrieve data from json file
  var retrieveData = $.getJSON(jsonUrl); 
  
    retrieveData.done(function(JSONdata){
        interpreter(JSONdata, trialIdentifier, orderNum);
    })
    
}

//Main function calling all subfunctions
function interpreter(dataInput, setInput, orderNum){
    json=dataInput;
	set=setInput;
	var setData = [];
    if (setInput==0)
		{setData=dataInput["sets"][0]}
		else
		{
		dataInput["sets"].forEach(function(item){
        if (item["name"] == setInput){
            setData = item;
        };
		});
		}
    
    //insert the basic structure (columns and rows)
    var orderData = dataInput["optOrders"];
    var optionData = dataInput["opt"];
	var attrData = dataInput["attr"];
	var cellData = dataInput["cell"];
	var delayData = dataInput["delay"];
	var styleInput = dataInput["styles"];
	
    insertStructure(setData, orderData, optionData, attrData, orderNum);
    
    //insert stimuli/text in the boxes
    insertStimuli(setData, optionData, attrData, cellData,styleInput,delayData);
    
    //insert styling (width, blur, closed boxes, classes etc.)
    //insertStyles(setData, styleInput, optionData, attrData, cellData);
    
    //put all added variables, including condition number, in hidden input fields
    fillAddedVariables(setData);
	
    //call InitBoxes to make the boxes active/hoverable
	InitBoxes();
   
   	}



//Main function for displaying the structure (rows and columns
function insertStructure(dataInput, orderInput, optionInput, attrInput, orderNum){
    var optList = [];
	var attrList = [];
	//retrieve the order and resolve random is necessary
    if(orderNum == "random"){
        orderNum = getRandom(0, (dataInput["optOrder"].length-1));
    }
    //otherwise take modulo of orderNum
	var orderID = dataInput["optOrder"][orderNum%dataInput["optOrder"].length];
    
    orderInput.forEach(function(item){
        if(item["name"] == orderID){
            orderO = item["opt"];
			orderA = item["attr"];
		optionInput.forEach(function(item){
            optList.push(item["name"]);
		});
		switch (orderO) {
			case "standard":
			orderO=optList;
			break;
			case "reverse":
			orderO=[];
			for (i=0;i<optList.length;i++)
					{orderO[i]=optList[optList.length-i-1]}
			break;
			case "random":
			orderO=shuffle(optList);
			break;
			default:
		}
		
		attrInput.forEach(function(item){
            attrList.push(item["name"]);
		});
		switch (orderA) {
			case "standard":
			orderA=attrList;
			break;
			case "reverse":
			orderA=[];
			for (i=0;i<attrList.length;i++)
					{orderA[i]=attrList[attrList.length-i-1]}
			break;
			case "random":
			orderA=shuffle(attrList);
			break;
			default:
		}
		orderAnum=[];
		for( var j = 0; j<orderA.length;j++)
		{
			orderAnum[j]=attrList.indexOf(orderA[j]);
		}
	}
    });
    
    //call the main structural functions
    insertRows(dataInput);
    insertColumns(dataInput, optionInput);
	
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
function insertRows(dataInput){
    var numOptions=orderO.length;
    var numAttributes=orderA.length; 
	var rowCounter = 0;
    var rowArray;
     
    for(i=0; i<numOptions; i++){ //drie keer voor iedere optie
		
         if(dataInput["layout"] == "attributeCol"){
					totalRows = numOptions;
					totalCols = numAttributes;
		
                    if((dataInput['displayLabels'] == "all" || dataInput['displayLabels'] == "attOnly") && i==0){
                        topLabels = true;
                    }
                    
                }else{
                    totalRows = numAttributes;
					totalCols = numOptions;
					
                        if((dataInput['displayLabels'] == "all" || dataInput['displayLabels'] == "optOnly") && i==0){
                        topLabels = true;  }
                }
			}
         ;
    
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
function insertColumns(dataInput, optionInput){
    var numOptions = orderO.length;
	var numAttributes=orderA.length; 
	
    var rowCounter = 0;
    var colCounter = 0;
    var topLabelCounter = 0;
    
    for(i=0; i<numOptions; i++){ 
        var currentOption = orderO[i];
        
        optionInput.forEach(function(item){
            if(item["name"] == currentOption){
                colCounter = 0;
		
			if(dataInput["layout"] == "attributeCol"){
                    numRows = 1;
                }else{
                    numRows = totalRows;
                }
                for(j=0; j<numRows; j++){
                    
                    if(dataInput["layout"]=="attributeCol"){
                        numCols=totalCols;
						rowCounter++;
                    }else{
                       numCols = 1;
					   rowCounter = (j+1);
                    							
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
                       
                        if(topLabels == true && j==0 && ((dataInput["layout"] == "optionCol" && topLabelCounter < totalCols) || (dataInput["layout"] == "attributeCol" && i == 0))){
                            topLabelCounter++;
                            $("#headerLabels").append('<div id="headerLabel' + (topLabelCounter) + '" class="headerElement w3-col"></div>');
                            $("#headerLabel" + (topLabelCounter)).append('<div id="headerLabel' + (topLabelCounter) + '_txt" class="headerTxt w3-display-container"></div>');
                        }
                        
						$("#row" + rowCounter).append('<div id="' + currentOption + (colSelector) + '" class="colElement w3-col"></div>');
                         
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

        }  
    }
    if(sideButtons == true){
        var rowBtnCounter = 0;
        for(l = 0; l < (orderO.length); l++){
            rowBtnCounter++;
            $("#row" + (rowBtnCounter)).append('<div id="button' + orderO[l] + '" class="buttonCell w3-col"></div>');
            $("#button" + orderO[l]).append('<div id="button' + orderO[l] + '_txt" class=" buttonTxt w3-display-container"></div>');
            }
    }
   
}



//insert stimuli in the boxes
function insertStimuli(dataInput, optionInput, attrInput, cellInput,styleInput,delayInput){
    var randomTxtArray = [];
    var workingArray = [];
	varList = [];
    var txtNumber;
    var txtSelector;
	var varSelector;
	var boxLabelSelector;
   var sideLabelCounter = 0;
       
    for(i = 0; i < orderO.length; i++){
            
        optionInput.forEach(function(item){
                
            if(item["name"] == orderO[i]){
                var cellCounter = 0;
                currentOption=orderO[i];
				optionWidth = item["width"];
				
				orderAnum.forEach(function(k){
					cellCounter++;
					
					txtNumber = k;
									
					
					var cellSel = (cellInput[txtNumber][currentOption]);
					// check number of columns
					if (cellSel.length)
						{
						var multipleCells=1;
						if (cellSel[0].length)
							{
							var cellCols=cellSel[0].length;
							var cellRows=cellSel.length;
							}
							else
							{//only one row
							cellRows=1;
							cellCols=cellSel.length;
							}
						}
						else
						{
						var multipleCells = 0;
						var cellRows=1;
						var cellCols=1;
						}
					
				//set attributeOrder					
					if(i == 0){
						if(attributeOrder != ""){
							attributeOrder += "/";
							attNumericOrder += "/";
						}
						attributeOrder += attrInput[txtNumber]["name"];
						attNumericOrder += txtNumber;
					}
				 
				for (cr=0;cr<cellRows;cr++)
					{
					if (multipleCells)
					{
					$("#" + currentOption + (cellCounter)).css("width",item["width"]).append('<div id="' + currentOption + (cellCounter)+'r'+(cr+1)+'" class="w3-row"></div>')
					}
				
					for (cc=0;cc<cellCols;cc++)
					{
					if (!multipleCells)
						{
						addLabel="";
						txtSelector = (cellInput[txtNumber][currentOption]["txt"]);
						boxLabelSelector = (cellInput[txtNumber][currentOption]["box"]);
						varSelector = (cellInput[txtNumber][currentOption]["var"]);
						styleSelector = (cellInput[txtNumber][currentOption]["style"]);
						}
					else
					{
						addLabel="_"+(cr+1)+"_"+(cc+1);
						$("#" + currentOption + (cellCounter) + "r"+(cr+1)).append('<div id="' + currentOption + (cellCounter) + addLabel+'" class="colElement w3-col"></div>');
					
					if (cellRows==1)
						{
						txtSelector = (cellInput[txtNumber][currentOption][cc]["txt"]);
						boxLabelSelector = (cellInput[txtNumber][currentOption][cc]["box"]);
						varSelector = (cellInput[txtNumber][currentOption][cc]["var"]);
						styleSelector = (cellInput[txtNumber][currentOption][cc]["style"]);
						ph = (cellInput[txtNumber][currentOption][cc]["pheight"])
						pw = (cellInput[txtNumber][currentOption][cc]["pwidth"])
						
						}
						else 
						{
						txtSelector = (cellInput[txtNumber][currentOption][cr][cc]["txt"]);
						boxLabelSelector = (cellInput[txtNumber][currentOption][cr][cc]["box"]);
						varSelector = (cellInput[txtNumber][currentOption][cr][cc]["var"]);
						styleSelector = (cellInput[txtNumber][currentOption][cr][cc]["style"]);
						ph = (cellInput[txtNumber][currentOption][cr][cc]["pheight"])
						pw = (cellInput[txtNumber][currentOption][cr][cc]["pwidth"])
						
						}
					}	
					
					if (multipleCells)
					{
					cellH=(parseInt(attrInput[txtNumber]["height"])*ph)+"px";
					cellW=(pw*100)+"%";
					}
					else
					{cellH=attrInput[txtNumber]["height"];
					cellW=item["width"];}
				
					var cellSelector = currentOption + (cellCounter)+addLabel;
					$("#" + cellSelector).attr("name",varSelector).css("width",cellW);
					varList.push(varSelector);
					
					$("#" + cellSelector).append('<div id="' + currentOption + (cellCounter)+addLabel + '_txt" class="w3-display-container textBox" style="height: '+cellH+';"></div>');
                        $("#" + cellSelector).append('<div id="' + currentOption + (cellCounter) +addLabel+ '_box" class="w3-display-container mask" style="height: '+cellH+';"></div>');  
					
					
					//if the element uses a container like div, img or span, do not add a w3-display-middle class
					// other add it to improve the layout
					if ($.inArray(txtSelector.substr(0,4).toLowerCase(),["<div","<img", "<spa"])>-1) 
						{
							$("#" + cellSelector+ "_txt").append(txtSelector);
						} 
						else
						{
							$("#" + cellSelector + "_txt").append('<div class="w3-display-middle"><p>' + txtSelector + '</p></div>');
						}
					
					if ($.inArray(boxLabelSelector.substr(0,4).toLowerCase(),["<div","<img", "<spa"])>-1) 
						{
							$("#" + cellSelector+ "_box").append(boxLabelSelector);
						}
						else
						{
							$("#" + cellSelector + "_box").append('<div class="w3-display-middle"><p>' + boxLabelSelector + '</p></div>');
						}
					//styles 
					styleInput.forEach(function(item){
						if(item["name"] == "defaults")
						{
						//reset defaults for every style assignment
						def = item["mainClass"];
						def_txt = item["txtClass"];
						def_box = item["boxClass"];
						def_labelTxt = item["labelClass"];
						def_btnClass = item["btnClass"];
						def_btnTxt = item["btnTxt"];
						btnSel = item["btnSel"];
						btnSel = item["btnSel"];
						}
						
						if(item["name"] == styleSelector)
							{
							if(item["mainClass"] != "default"){
								def = item["mainClass"]; }
							if(item["txtClass"] != "default"){
								def_txt = item["txtClass"];}
							if(item["boxClass"] != "default"){
								def_box = item["boxClass"];}
								 
													
							assignClasses(def, cellSelector, "id");
							assignClasses(def_box, cellSelector+ "_box", "id");
							assignClasses(def_txt, cellSelector+ "_txt", "id");
						
							if(item["boxType"] == "blur")		
								{assignClasses(def_txt, cellSelector+"_box", "id");}
							else
								{assignClasses(def_box, cellSelector+"_box", "id");}
       
							//set display for boxtypes
							   if(item["boxType"] != "open"){
									$("#" + cellSelector+"_txt").css("display", "none");
								}else{
								   $("#" + cellSelector+"_box").css("display", "none");
								}
								if(item["boxType"] == "blur"){
									blurBoxes.push(cellSelector+"_box");
									//$(".mask").remove();
								}
								if(item["boxType"] != "open"){
									$("#" + cellSelector).addClass("Hoverable")
								}
							
							
							}
						if(item["name"] == "label")
							{
							if(item["labelClass"] != "default"){
							def_labelTxt = item["labelClass"];}
							
							labelWidth=item["width"];
							labelHeight=item["height"];
							}
						if (item["name"]=="button") {
							if(item["btnClass"] != "default"){
							def_btnClass = item["btnClass"];}
							 if(item["btnTxt"] != "default"){
							 def_btnTxt = item["btnTxt"];}
							 if(item["btnSel"] != "default"){
							 btnSel = item["btnSel"];}
							 if(item["btnNotSel"] != "default"){
						btnNotSel = item["btnNotSel"];}
							buttonWidth = item["width"];
							buttonHeight = item["height"];
						}							 
										

						})
					}	
				}		
				//optionWidth = 	$("#"+currentOption + (cellCounter)).css("width");
				
					if(i == 0){
						if(dataInput["displayLabels"] == "attOnly" || dataInput["displayLabels"] == "all"){
							if(dataInput["layout"] == "attributeCol"){
								$("#headerLabel" + (txtNumber+1) + "_txt").append('<div class="w3-display-middle">' + attrInput[txtNumber]["label"] + '</div>').css("height",labelHeight);
								$("#headerLabel" + (txtNumber+1)).css("width",optionWidth)
								$("#headerLabel0").css("width",labelWidth);
								$("#headerLabel0_txt").css("height",labelHeight);
				
								
							}else{
								$("#sideLabel" + (cellCounter) + "_txt").append('<div class="w3-display-middle">' + attrInput[txtNumber]["label"] + '</div>').css("height",attrInput[txtNumber]["height"]);
								$("#sideLabel"+ (cellCounter)).css("width",labelWidth);
								
							}
						}
					}
				
				if (k==0){
					if(dataInput["displayLabels"] == "optOnly" || dataInput["displayLabels"] == "all"){
					if(dataInput["layout"] == "attributeCol"){
						$("#sideLabel" + (i+1)).css("width",labelWidth);
						$("#sideLabel" + (i+1) + "_txt").append('<div class="w3-display-middle">' + item["label"] + '</div>').css("height",attrInput[txtNumber]["height"])
						;
					}else{
						$("#headerLabel" + (i+1)).css("width",optionWidth);
						$("#headerLabel" + (i+1) + "_txt").append('<div class="w3-display-middle">' + item["label"] + '</div>').css("height",labelHeight);
						$("#headerLabel0").css("width",labelWidth);
						$("#headerLabel0_txt").css("height",labelHeight);
				
						}
                    }
					
				}
				})
				assignClasses(def, "sideElement", "class");
				assignClasses(def_labelTxt, "sideTxt", "class");
				 assignClasses(def, "headerElement", "class");
            assignClasses(def_labelTxt, "headerTxt", "class");
                
			   if (item["txt_button"]) {txtButton=item["txt_button"]} else {txtButton=item["label"]}
			   
                $("#button" + currentOption + "_txt").append('<button type="button" class="choiceButton" id="' + currentOption + '" name="choice" value="' + currentOption + '">' + txtButton + '</button>');
				if(sideButtons){
					$("#button" + currentOption).css("width",buttonWidth);
				$("#button" + currentOption+ "_txt").css("height",attrInput[txtNumber]["height"]);
				}
				else{
					$("#button" + currentOption).css("width",optionWidth);
				$("#button" + currentOption+ "_txt").css("height",buttonHeight);
				
				}
				$("#button0").css("width",labelWidth);
				$("#button0").css("height",buttonHeight);
				
				
				assignClasses(def, ("buttonCell"), "class");
				assignClasses(def_btnTxt, ("buttonTxt"), "class");
				assignClasses(def_btnClass, ("choiceButton"), "class");  
				assignClasses(def_btnNotSel, ("choiceButton"), "class");  // set all buttons to not selected
                
            }
        });
    }
	//create delaymatrix
	for( var i = 0; i<varList.length;i++)
	{
			delayMatrix[varList[i]] = [];
		for( var j = 0; j<varList.length;j++)
		{
			var di=delayInput["var"].indexOf(varList[i]);
			var dj=delayInput["var"].indexOf(varList[j]);
		
			if (di>-1 && dj>-1) {
			delayMatrix[varList[i]][varList[j]]=delayInput["delays"][di][dj];}
			else 
			{delayMatrix[varList[i]][varList[j]]=0;}
			}
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

function assignClasses(classInput, divElement, elementType){
    for(j=0; j < classInput.length; j++){
        if(elementType == "id"){var sel = "#"} else {var sel="."}; 
			 $(sel + divElement).addClass(classInput[j]);
        }
}
function removeClasses(classInput, divElement, elementType){
    for(j=0; j < classInput.length; j++){
        if(elementType == "id"){var sel = "#"} else {var sel="."}; 
			 $(sel + divElement).removeClass(classInput[j]);
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
    
    for(j=0; j < orderO.length; j++){
        if(j==0){
            orderString = orderO[j];
        }else{
            orderString = orderString + "-" + orderO[j];
        }   
    }
    $("#mlwebform").append('<input type=hidden name="optionOrder" value="' + orderString + '">');
    $("#mlwebform").append('<input type=hidden name="attributeOrder" value="' + attributeOrder + '">');
	$("#mlwebform").append('<input type=hidden name="jsonfile" value="' + jsonFile + '">');
	$("#mlwebform").append('<input type=hidden name="set" value="' + set + '">');
	
}


