<?php
session_start();
if (isset($_SESSION['jsonInput']))
{
	$jsonInput = addslashes($_SESSION['jsonInput']);
}
else
{$jsonInput = '{"styles":[{"name":"defaults","mainClass":["w3-white","w3-center","w3-padding-small"],"txtClass":["w3-light-blue"],"boxClass":["w3-indigo"],"labelClass":["w3-white"],"btnClass":["w3-button","w3-block","w3-border","w3-border-gray","w3-round-xlarge","w3-display-middle"],"btnTxt":["w3-white"],"btnSel":["w3-blue","w3-hover-blue"],"btnNotSel":["w3-light-blue"]},{"name":"A","mainClass":"default","txtClass":"default","boxClass":"default","boxType":"closed"},{"name":"label","width":"10%","labelClass":"default","height":"50px"},{"name":"button","btnClass":"default","btnTxt":"default","btnSel":"default","btnNotSel":"default","height":"30px","width":"10%"}],"opt":[{"name":"A","label":"option A","width":"30%"}],"attr":[{"name":"attr1","label":"attr1","height":"50px"}],"cell":[{"A":{"var":"box1","txt":"inside box1","box":"outside box1","style":"A"}}],"delay":{"var":["box1"],"delays":[[0]]},"optOrders":[{"name":"order1","opt":"standard","attr":"standard"}],"sets":[{"name":"dynSet","optOrder":["order1"],"layout":"optionCol","buttons":"on","displayLabels":"all","addedVars":["test=2"]}]}';}
?>
<html>
    <head>
        <title>JSON editor</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!--<script type="text/javascript" src="main.js"></script>-->
        <script type="text/javascript" src="main.js"></script>
        <script type="text/javascript" src="jquery-3.1.1.min.js"></script>
        <script src="jquery.foggy.min.js"></script>
        <script language=javascript src="mlweb20.js"></script>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
        <link rel="stylesheet" href="w3.css">
		<link rel="stylesheet" href="mouselabEditor.css"/>												  
		<script src="mouselabEditor.js"></script>
        
	
    </head>

    <body class="w3-light-grey w3-content" style="max-width:1600px" onLoad="timefunction('onload', 'body', 'body')">
        <!--BEGIN set vars-->
        
<FORM id="mlwebform" name="mlwebform" onsubmit="return false;">
 
			<INPUT type=hidden id='processData' name="procdata" value="">
            <!-- set all variables here -->
            <input id="expName" type=hidden name="expname" value="test">
            <input type=hidden name="nextURL" value="">
            <input type=hidden name="to_email" value="">
            <!--these will be set by the script -->
			<input type=hidden name="subject" value="">
			<input type=hidden name="condnum" value="">
			<input id="choice" type=hidden name="choice" value="">
			

<div class="w3-twothird">
        <header class="w3-container w3-blue">
            <h1>MouselabWEB 2.0 JSON editor</h1>
        </header>
        <div class="w3-white w3-container">

            <h1>MouselabWEB table</h1>
            <p>below the mouselabWEB table will be shown based on the JSON code you enter on the right</p>
            <!--<button type="button" id="addButton">add</button>-->
            <!--<button type="button" id="delButton">del</button>-->
            <!--<button type="button" id="attriButton">attri</button>-->
            <!--<button type="button" id="attriDelButton">attriDel</button>-->
            <!--<button type="button" id="blurButton">blur</button>-->
            <div id="previewPositioning"><div id="preview" class="w3-white w3-container w3-col"></div></div>
            <!--<div class="dropdown">
                <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">Styles<span class="caret"></span></button>
                    <ul class="dropdown-menu" role="menu" aria-labelledby="menu1">
                        <li class="dropdown-item stylingButton" id="uniform">Uniform</li>
                        <li class="dropdown-item stylingButton" id="byOpt">By column</li>
                        <li class="dropdown-item stylingButton" id="byAtt">By row<li>
                    </ul>
            </div>-->
            <button type="button" id="undoButton">Undo</button>
            <button type="button" id="redoButton">Redo</button>
            <button type="button" id="downloadButton">Download</button>
            <!-- structure below to hide the "no files selected" of file input-->
            <input type="file" id="fileInput" style="display: none;"/>
            <input type="button" value="Select file" onclick="document.getElementById('fileInput').click();" />
            <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle" id="nameButton" type="button" data-toggle="dropdown">File name
                <span class="caret"></span></button>
                <ul class="dropdown-menu" role="menu" aria-labelledby="menu1">
                    <input type="text" id="fileNameInput">
                </ul>
            </div>
            <div class="dropdown">
                <button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown">Styles
                    <span class="caret"></span></button>
                    <ul class="dropdown-menu" role="menu" aria-labelledby="menu1" id="stylesButton">
                        <li class="dropdown-item" id="newStyleButton">Add new</li>
                        <li class="dropdown-divider"></li>
                    </ul>
            </div>
            <p></p>



            <div id="container"  class="w3-white w3-container w3-col" style="width:90%">
            </div>
        </div>
		<div class="w3-white w3-container w3-center w3-padding">
			<button class="confirm w3-button w3-center w3-round-xlarge" name="submit" value="confirm">Confirm</button>
		</div>
		<p>Click here to show the event data. 
<INPUT type=button name="Show" value="Show Data" onClick="alert(document.forms[0].procdata.value)">
</p>
        <footer class="w3-container w3-blue">
		<h4>(C) Martijn Willemsen and Martijn ter Meulen</h4>
        </footer>
</div>
<div class="w3-third">

    <div id="editor" class="w3-container">
<button id="BTNstyles" type="button" onclick="showJSON('styles')" class="w3-button w3-block w3-small w3-left-align w3-light-blue w3-hover-blue">
Styles &#9660;</button>

<div id="styles" class="w3-container w3-hide w3-blue w3-padding-small">
  <textarea rows=5 cols=50 class="w3-small" id="JSON_styles" style="width: 100%"></textarea>
  <button type="button" onclick="updateJSON('styles')" class="w3-button w3-round w3-block w3-grey w3-small">update</button>

  </div>
	<button id="BTNopt" type="button" onclick="showJSON('opt')" class="w3-button w3-block w3-small w3-left-align w3-light-blue w3-hover-blue">
	Opt &#9660;</button>

<div id="opt" class="w3-container w3-hide w3-blue w3-padding-small">
  <textarea rows=5 cols=50 class="w3-small" id="JSON_opt" style="width: 100%"></textarea>
  <button type="button" onclick="updateJSON('opt')" class="w3-button w3-round w3-block w3-grey">update</button>
</div>
	
	<button id="BTNattr" type="button" onclick="showJSON('attr')" class="w3-button w3-block w3-small w3-left-align w3-light-blue w3-hover-blue">
	Attr &#9660;</button>

<div id="attr" class="w3-container w3-hide w3-blue w3-padding-small">
  <textarea rows=5 cols=50 class="w3-small" id="JSON_attr" style="width: 100%"></textarea>
  <button type="button" onclick="updateJSON('attr')" class="w3-button w3-round w3-block w3-grey">update</button>
</div>
	
	<button id="BTNcell" type="button" onclick="showJSON('cell')" class="w3-button w3-block w3-small w3-left-align w3-light-blue w3-hover-blue">
	Cell &#9660;</button>

<div id="cell" class="w3-container w3-hide w3-blue w3-padding-small">
  <textarea rows=5 cols=50 class="w3-small" id="JSON_cell" style="width: 100%"></textarea>
  <button type="button" onclick="updateJSON('cell')" class="w3-button w3-round w3-block w3-grey">update</button>
</div>

<button id="BTNdelay" type="button" onclick="showJSON('delay')" class="w3-button w3-block w3-small w3-left-align w3-light-blue w3-hover-blue">
	Delay &#9660;</button>

<div id="delay" class="w3-container w3-hide w3-blue w3-padding-small">
  <textarea rows=5 cols=50 class="w3-small" id="JSON_delay" style="width: 100%"></textarea>
  <button type="button" onclick="updateJSON('delay')" class="w3-button w3-round w3-block w3-grey">update</button>
</div>

<button id="BTNoptOrders" type="button" onclick="showJSON('optOrders')" class="w3-button w3-block w3-small w3-left-align w3-light-blue w3-hover-blue">
	OptOrders &#9660;</button>

<div id="optOrders" class="w3-container w3-hide w3-blue w3-padding-small">
  <textarea rows=5 cols=50 class="w3-small" id="JSON_optOrders" style="width: 100%"></textarea>
  <button type="button" onclick="updateJSON('optOrders')" class="w3-button w3-round w3-block w3-grey">update</button>
</div>

<button id="BTNsets" type="button" onclick="showJSON('sets')" class="w3-button w3-block w3-small w3-left-align w3-light-blue w3-hover-blue">
	Sets &#9660;</button>

<div id="sets" class="w3-container w3-hide w3-blue w3-padding-small">
  <textarea rows=5 cols=50 class="w3-small" id="JSON_sets" style="width: 100%"></textarea>
  <button type="button" onclick="updateJSON('sets')" class="w3-button w3-round w3-block w3-grey">update</button>
</div>



	</div>	

	set:<input type="text" id="trialid" style="width: 100px;"/>&nbsp;&nbsp; 
	<input type=button id="update" value="update" class="w3-button w3-blue w3-padding w3-round"/>
 </div>

        <script type="text/javascript">

      jsonData = JSON.parse('<?php echo($jsonInput);?>');
				
			interpreter(jsonData, 0, 0);
				
            
			function printJSON() {
			$('#JSON_styles').val(JSON.stringify(json["styles"],null,'\t'));
			$('#JSON_opt').val(JSON.stringify(json["opt"],null,'\t'));
			$('#JSON_attr').val(JSON.stringify(json["attr"],null,'\t'));
			$('#JSON_cell').val(JSON.stringify(json["cell"],null,'\t'));
			$('#JSON_delay').val(JSON.stringify(json["delay"],null,'\t'));
			$('#JSON_optOrders').val(JSON.stringify(json["optOrders"],null,'\t'));
			$('#JSON_sets').val(JSON.stringify(json["sets"],null,'\t'));
			}

			function showJSON(handle){
				var x = document.getElementById(handle);
				if (x.className.indexOf("w3-show") == -1) {
				x.className += " w3-show";
				$('#BTN'+handle).removeClass("w3-light-blue").addClass("w3-blue");
				var btntxt=$('#BTN'+handle).html();
				console.log(btntxt)
				$('#BTN'+handle).html(btntxt.substr(0,btntxt.length-1)+"&#9650;");
				
				} else { 
				x.className = x.className.replace(" w3-show", "");
				$('#BTN'+handle).removeClass("w3-blue").addClass("w3-light-blue");
				var btntxt=$('#BTN'+handle).html();
				$('#BTN'+handle).html(btntxt.substr(0,btntxt.length-1)+"&#9660;");
				
				}
				return false;
			}
			function updateJSON(handle) {
				var jsonPart = $('#JSON_'+handle).val();
				if (jsonPart) {
						try { jsonChange = JSON.parse(jsonPart); }
						catch (e) { alert('Error in parsing json. ' + e); return false}
						jsonVal[handle]=jsonChange;
						//console.log(jsonVal[handle])
				
						showJSON(handle);
						selectedElements = [];
    
						updateScreenJson(jsonVal);
						
					} else {
						jsonChange = {};
					}
					}

				
			function refreshTrial(trialIdentifier, orderNum){
				 blurBoxes = [];
				 order = [];
				 attributeOrder = "";
				 attNumericOrder = "";
				 JSONData = [];

				 topLabels = false;
				 sideLabels = false;
				 bottomButtons = false;
				 sideButtons = false;
				 numRows = 0;
				 numCols = 0;
				 totalRows = 0;
				 totalCols = 0;
				 item = [];

				   $("#container").empty();
				   interpreter(json,trialIdentifier, orderNum);
				}


     		//function that starts the page
			$(document).ready(function () { 

				

				
				$("#update").click(function (){
				//refreshTrial($("#trialid").val(), $("#oNum").val());
				updateScreenJson(json)
				});
				

				
				initializeEdit();
				$("#trialid").val(json["sets"][0]["name"]);
				printJSON();
				});	
				



        </script>
    </FORM>
    </body>
</html>