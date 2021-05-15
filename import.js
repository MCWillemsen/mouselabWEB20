//
//  Mlweb designer script  (editor)
//
//       v 1.00c, nov 22, 2020
    
//		improvement version 1.00c: more than 26 rows (rows 27-52 are labeled with capital letters)
//
//     (c) 2003-2008 Martijn C. Willemsen and Eric J. Johnson 
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


function getCol(matrix, col){
       var column = [];
       for(var i=0; i<matrix.length; i++){
          column.push(matrix[i][col]);
       }
       return column; // return column data..
    }
	
function abc_num(str)
{
if (str.charCodeAt(0)>96)
{
//row 1-26: lowercase (a0)
out=str.charCodeAt(0)-97;
}
else
{
//row 26-52: uppercase	(A0)
out=26+str.charCodeAt(0)-65;}
return out
}

function row_str(row)
{
	if (row<26)
	{out=String.fromCharCode(row+97)}
else
	{out=String.fromCharCode(row-26+65)}
return out
}

function repl_sep(a)   
{
// encode separators ^ and ` into HTML code tags 
a=a.replace(/[\x5E]/gi, "&#94;");
a=a.replace(/[\x60]/gi, "&#96;");
return a;
}

function fac(x)
{
// Faculty: x!=x(x-1)...1
var outp=1;
for (var i=1; i<=x; i++)
{outp=outp*i}
return outp
}

function ExpMatrix(M)
{ 
// expand string into data matrix
// ^ is column split, ` is row split
var Mrows=M.split("`");

var outM = new Array();
for (rowcount=0;rowcount<Mrows.length;rowcount++)
	{
	outM[rowcount]=Mrows[rowcount].split("^")
	}
return outM;
}

function ExpRow(M)
{ 
// expand string into data vectors
// ^ is column split

var outM = new Array();
outM = M.split("^") 
return outM;
}

function swapArrayElem(a, col1, col2)
{
// sway two elements of an array
var temp = a[col1];
a[col1] = a[col2];
a[col2] = temp;
}

function copyOfArray(carray)
{
// duplicate the array 
var out = new Array();
for (var i=0;i<carray.length;i++)
{out[i]=carray[i]}
return out
}

function swapArray(array1, array2)
{
// sway two arrays 
var temp = new Array();
temp = copyOfArray(array1);
array1 = copyOfArray(array2);
array2 = copyOfArray(temp);
}

function cHTML(a)
{
a=a.replace(/[<]/gi, "&lt;")
a=a.replace(/[>]/gi, "&gt;")
//a=a.replace(/[\n]/gi, "<BR>")
return a
}

function CountBal(subjnr, num)
{
// counterbalance based on subj number. 
// first subject is 0
// Num is number of options to counterbalance
// (number of orders is Num!)

var numOrd=fac(num);
start = subjnr - numOrd*Math.floor((subjnr-1)/numOrd)

orderstr=""
for (var i=0;i<num;i++)
{orderstr+=i.toString()}

outstr=""
for (var i=num; i>0; i--)
{
var den=fac(i-1);
pos = Math.floor((start-1)/den)+1
outstr+=orderstr.charAt(pos-1)+","
orderstr = orderstr.substring(0,pos-1)+orderstr.substr(pos)
start=start-(pos-1)*den
}
outstr=outstr.substr(0,outstr.length-1)
return outstr.split(",")
}

if (document.getElementById)  
	{
	// IE6/NS6>/Mozilla
	IE6_moz=true;
	IE4_5=false;
	}
else if (document.all)
	{
	IE6_moz=false;
	IE4_5=true;
	}

// insert function to insert text in textarea
// from phpMyAdmin
function insertAtCursor(myField, myValue) 
	{
	//IE support
	if (document.selection) {
		myField.focus();
		sel = document.selection.createRange();
		sel.text = myValue;
		}
	//MOZILLA/NETSCAPE support
	else if (myField.selectionStart || myField.selectionStart == '0') {
		var startPos = myField.selectionStart;
		var endPos = myField.selectionEnd;
		myField.value = myField.value.substring(0, startPos)
		+ myValue
		+ myField.value.substring(endPos, myField.value.length);
		} 
		else {
		myField.value += myValue;
		}
}

function scaleDef(name, num_points, showValues, capture, width, value, label)
{ // scale object used for storing scale data
this.name=name
this.num_points = num_points
this.showValues = showValues
this.capture = capture
this.width = width
this.value = value
this.label = label
}
scale = new scaleDef();
scale.value = new Array();
scale.label = new Array();
scale.name = "";
scale.num_points = 0;
scale.capture = false;

function choiceDef(name, num_options, capture, value, label, type)
{
this.name = name
this.num_options = num_options
this.capture = capture
this.value = value
this.label = label
this.type = type
}

choice = new choiceDef();
choice.name="";
choice.num_options = 0;
choice.value = new Array();
choice.label = new Array();
choice.capture = false;

function chkConnects()
{

cf=new Array()  // position of fixed cols
c1=new Array()  // position of c1 cols

for (var i=0; i<colType.length; i++)
	{
	switch (parseInt(colType[i]))
		{ 
		case 0: cf[cf.length]=i;break;
		case 1: c1[c1.length]=i;break;
		}
	}

rf=new Array()  // position of fixed rows
r1=new Array()  // position of c1 rows

for (var i=0; i<rowType.length; i++)
	{
	switch (parseInt(rowType[i]))
		{ 
		case 0: rf[rf.length]=i;break;
		case 1: r1[r1.length]=i;break;
		}
	}

// subjDen is the denominator used to devide the subj number for each counterbalance step

subjDen = 1;   

// first determine column and row connects and switch on that


var numCond = (c1.length>0 ? fac(c1.length) : 1)*(r1.length>0 ? fac(r1.length) : 1);
console.log(cf,c1,rf,r1)
return numCond;
}

// Set default values
activeRow = -1;
activeCol = -1;

colType = new Array();
rowType = new Array();
colWidth = new Array();
rowHeight = new Array();

CBcolList = new Array();
CBrowList = new Array();

txtM = new Array();
txtM[0]= new Array();

boxM = new Array();
boxM[0]= new Array();

stateM = new Array();
stateM[0]=new Array();

tagM = new Array();
tagM[0]=new Array();

globalshown=false;
globalEdit = 2;  // which part to edit

btnFlg = 0; // 0 is no buttons, 1 is col buttons, 2 is row buttons
btnTxt = new Array();
btnState = new Array();
btnTag = new Array();
btnType = "radio";

masterCond = 1;
nextURL = "thanks.html";
expname = "";
to_email = "";
mlweb_outtype = "";
mlweb_fname = "";
randomOrder = false;

defaultWidth= 100;
defaultHeight = 50;

colFix = false;
rowFix = false;
CBpreset = false;


tmActive = false;
//default values (not used, only for initialization)
// actual defaults are layer in start.html 
tmTotalSec = 60;
tmStepSec = 1;
tmShowTime = true;
tmFill = true;
tmDirectStart = true;
tmWidthPx = 200;
tmMinLabel = "min";
tmSecLabel = "sec";
tmLabel = "Timer: ";
tmPos = 0;

preHTML = "";
postHTML = "";
windowName = "MouselabWEB Survey";
submitName = "Next Page";
warningTxt = "Some questions have not been answered. Please answer all questions before continuing!";

chkFrm = false;

evtOpen = 0;  // default value for open event 0=mouseover, 1=click
evtClose = 0; // default value for close event 0=mouseout, 1=click, 2=none (box stays open)

undo1="";
undo2="";

headerStr="<?php\r\nsession_start();\r\nif (isset($_GET['subject'])) \r\n{$subject=$_GET['subject'];$_SESSION['subject']=$subject;} \r\nelse {\r\n if (isset($_SESSION['subject'])) {$subject=$_SESSION['subject'];}\r\n else {$subject='anonymous';};}\r\n if (isset($_GET['condnum']))\r\n{$condnum=$_GET['condnum'];}\r\n else {\r\n	 if (isset($_SESSION['condnum'])) {$condnum=$_SESSION['condnum'];$_SESSION['condnum']=$condnum;}\r\n	else {$condnum=-1;};\r\n	}\r\n ?> \r\n <html>\r\n    <head>"
scriptStr="        <meta charset=\"UTF-8\">\r\n        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n        <script type=\"text/javascript\" src=\"main.js\"></script>\r\n        <script type=\"text/javascript\" src=\"jquery-3.1.1.min.js\"></script>\r\n        <script src=\"jquery.foggy.min.js\"></script>\r\n        <script language=\"javascript\" src=\"mlweb20.js\"></script>\r\n        <link rel=\"stylesheet\" href=\"w3.css\">\r\n		<link rel=\"stylesheet\" href=\"https://use.fontawesome.com/releases/v5.7.0/css/all.css\" integrity=\"sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ\" crossorigin=\"anonymous\">\r\n		\r\n		\r\n	</head> \r\n    <body class=\"w3-light-grey w3-content\" style=\"max-width:1600px\" onLoad=\"timefunction('onload', 'body', 'body')\">\r\n"
formStr = "<!--END set vars-->\r\n\<FORM id=\"mlwebform\" name=\"mlwebform\" onSubmit=\"return checkForm(this)\" method=\"POST\" action=\"save.php\">\r\n <INPUT type=hidden id='processData' name=\"procdata\" value=\"\"> \r\n   <!-- set all variables here -->\r\n"
othervarStr = "            <!--these will be set by the script -->\r\n			<input type=hidden name=\"subject\" value=\"<?php echo($subject)?>\">\r\n			<input type=hidden id=\"condnum\" name=\"condnum\" value=\"<?php echo($condnum)?>\">\r\n            <input id=\"choice\" type=hidden name=\"choice\" value=\"\">\r\n         <header class=\"w3-container w3-blue\">\r\n\    <h1>" 
footerStr="</button>\r\n\		</div>\r\n        <footer class=\"w3-container w3-blue\">\r\n		<h4>(C) Martijn Willemsen and Martijn ter Meulen</h4>\r\n        </footer>\r\n</div>\r\n         <script type=\"text/javascript\">"
endStr="     		//function that starts the page\r\n	$(document).ready(function () { \r\n		$(\".confirm\").click(function (event) {\r\n			if (choice==\"\" && $(\".choiceButton\").length>0) {event.preventDefault();return false;}\r\n      			});\r\n		});\r\n        </script>\r\n    </body>\r\n</html>"

function getStruct()
{ // get the structure from an exsisting page

// check for window title 
htmlCode = document.forms[0].txt.value;
startpos=(htmlCode.toUpperCase()).indexOf("<TITLE>");
if (startpos!=-1) {windowName=htmlCode.slice(startpos+7, (htmlCode.toUpperCase()).indexOf("</TITLE>"))} else {windowName="MouselabWEB Survey"};

//check for submit button text 
startpos=(htmlCode.toUpperCase()).indexOf("<INPUT TYPE=\"SUBMIT\"");
if (startpos!=-1) {submitstring=htmlCode.slice(startpos+28, (htmlCode.toUpperCase()).indexOf("\" ONCLICK",startpos));} else {submitstring==""};


//check for expname text 
startpos=htmlCode.indexOf("<input type=hidden name=\"expname\" value=\"");
if (startpos!=-1) {expname=htmlCode.slice(startpos+41, htmlCode.indexOf(">",startpos)-1);} else {expnamestring=""};
//check for nextURL text 
startpos=htmlCode.indexOf("<input type=hidden name=\"nextURL\" value=\"");
if (startpos!=-1) {nextURL=htmlCode.slice(startpos+41, htmlCode.indexOf(">",startpos)-1);} else {nextURLstring=""};
																		
//check for toemail text 
startpos=htmlCode.indexOf("<input type=hidden name=\"to_email\"");
if (startpos!=-1) {emailstring=htmlCode.slice(startpos, htmlCode.indexOf(">",startpos)+1);} else {emailstring=""};
																		   
// get pre-HTML and post-HTML
startpos=htmlCode.indexOf("<!--BEGIN preHTML-->");
if (startpos!=-1) {preHTML=htmlCode.slice(startpos+20, htmlCode.indexOf("<!--END preHTML-->"))} else {preHTML=""};
startpos=htmlCode.indexOf("<!--BEGIN postHTML-->");
if (startpos!=-1) {postHTML=htmlCode.slice(startpos+21, htmlCode.indexOf("<!--END postHTML-->"))} else {postHTML=""};


startpos=htmlCode.indexOf("<!--BEGIN TABLE STRUCTURE-->");
if (startpos==-1) {startpos=htmlCode.indexOf("<!--BEGIN phpESP TABLE STRUCTURE-->");var typeESP=true;} else {var typeESP=false;}
endpos=htmlCode.indexOf("<!--END TABLE STRUCTURE-->");

if (startpos==-1) {tablePresent=false} else {tablePresent=true};


	
if (tablePresent) 
{ // code to input mlwebtable page
var docstr="";
docstr+="<HTML><HEAD><SCRIPT language=\"javascript\">function loadMatrices(){return}<\/SCRIPT></HEAD><BODY>"+htmlCode.slice(startpos, endpos)+"<FORM>"+submitstring+"</FORM>Loading Structure</BODY></HTML>"
top.hiddenFrm.document.write(docstr);
top.hiddenFrm.document.close();

jsonDefault = '{"styles":[{"name":"defaults","mainClass":["w3-white","w3-center","w3-padding-small"],"txtClass":["w3-light-blue"],"boxClass":["w3-indigo"],"labelClass":["w3-white"],"btnClass":["w3-button","w3-block","w3-border","w3-border-gray","w3-round-xlarge","w3-display-middle"],"btnTxt":["w3-white"],"btnSel":["w3-blue","w3-hover-blue"],"btnNotSel":["w3-light-blue"]},{"name":"open","mainClass":"default","txtClass":"default","boxClass":"default","boxType":"open"},{"name":"closed","mainClass":"default","txtClass":"default","boxClass":"default","boxType":"closed"},{"name":"label","width":"10%","labelClass":"default","height":"50px"},{"name":"button","btnClass":"default","btnTxt":"default","btnSel":"default","btnNotSel":"default","height":"30px","width":"10%"}],"opt":[{"name":"A","label":"option A","width":"30%"}],"attr":[{"name":"attr1","label":"attr1","height":"50px"}],"cell":[{"A":{"var":"box1","txt":"inside box1","box":"outside box1","style":"A"}}],"delay":{"var":["box1"],"delays":[[0]]},"optOrders":[{"name":"order1","opt":"standard","attr":"standard"}],"sets":[{"name":"dynSet","optOrder":["order1"],"layout":"optionCol","buttons":"on","displayLabels":"all","addedVars":["test=2"]}]}'

json = JSON.parse(jsonDefault);

if (typeESP) {mlweb_outtype = "XML"; mlweb_fname="mlwebform";} else {mlweb_outtype = top.hiddenFrm.mlweb_outtype;mlweb_fname=top.hiddenFrm.mlweb_fname;}

txtM = copyOfArray(ExpMatrix(top.hiddenFrm.txt));
stateM = copyOfArray(ExpMatrix(top.hiddenFrm.state));  

tagM = copyOfArray(ExpMatrix(top.hiddenFrm.tag));	
boxM = copyOfArray(ExpMatrix(top.hiddenFrm.box));
colWidth = ExpRow(top.hiddenFrm.W_Col);
rowHeight = ExpRow(top.hiddenFrm.H_Row);

optCol=$("input[name='optCol']:checked").val();
if (optCol==1)	
{
	//options are in columns
	json["sets"][0]["layout"]="optionCol";
	vertLabel="col";horzLabel="attr";
}
else
{
	json["sets"][0]["layout"]="attributeCol";
	vertLabel="attr";horzLabel="opt";
}

vertLabels = [];
horzLabels = [];

//check if first horz is completely non-active
c=0;
for (i = 0; i < stateM[0].length; i++)
	{c+=parseInt(stateM[0][i])}
r=0;
for (i = 0; i < getCol(stateM,0).length; i++)
	{r+=parseInt(getCol(stateM,0)[i])}
console.log(c,r)
if (c==0) {
	// first horz inactive, check first vertumn
	if (r==0) 
	{
		
		vertLabels=Array.from(txtM[0])
		vertLabels.shift()
		horzLabels=Array.from(getCol(txtM,0))
		horzLabels.shift()
		
	}
	else
	{
		vertLabels=txtM[0]
		for (i=0; i<getCol(txtM,0).length;i++)
		{
			horzLabels[i]=horzLabel+(i+1)
		json["sets"][0]["displayLabels"]="none";

		}
		
	}
}
else
{
	if (r==0) 
	{
		for (i=0; i<txtM[0].length;i++)
		{
			vertLabels[i]=vertLabel+(i+1)
		}
		horzLabels=Array.from(getCol(txtM,0));
		horzLabels.shift()
	}
	else
	{
		for (i=0; i<txtM[0].length;i++)
		{
			vertLabels[i]=vertLabel+(i+1)
		}
		for (i=0; i<getCol(txtM,0).length;i++)
		{
			horzLabels[i]=horzLabel+(i+1)
		}
	}
		
}

if (optCol==1)
{
	if (c==0) 
	{
		if (r==0)
		{json["sets"][0]["displayLabels"]="all";}
		else
		{json["sets"][0]["displayLabels"]="optOnly";}
	}
	else
	{
		if (r==0)
		{json["sets"][0]["displayLabels"]="attrOnly";}
		else
		{json["sets"][0]["displayLabels"]="none";}
	}
}
else
{
	if (c==0) 
	{
		if (r==0)
		{json["sets"][0]["displayLabels"]="all";}
		else
		{json["sets"][0]["displayLabels"]="attrOnly";}
	}
	else
	{
		if (r==0)
		{json["sets"][0]["displayLabels"]="optOnly";}
		else
		{json["sets"][0]["displayLabels"]="none";}
	}	
}
console.log(horzLabels,vertLabels)


 for(var i = 1; i < json["styles"].length ; i++)
        {
            if(json["styles"][i]["name"] === "label")
            {
                labelStylepos = i;
            }
			if(json["styles"][i]["name"] === "button")
            {
                buttonStylepos = i;
            }
		}
w=0;
for (i = 0; i < colWidth.length; i++)
	{w+=parseInt(colWidth[i])}

if (r==0) {json["styles"][labelStylepos]["width"]=Math.round(100*colWidth[0]/w)+"%";rs=1} else (rs=0)
if (c==0) {json["styles"][labelStylepos]["height"]=rowHeight[0]+"px"; cs=1} else (cs=0)
	
for (i=rs;i<txtM[0].length;i++)
	{
		if (optCol==1)
		{
		json["opt"][i-rs]=JSON.parse("{\"name\": \""+tagM[0][i]+ "\",\"label\": \""+vertLabels[i]+ "\",\"width\": \""+Math.round(100*colWidth[i]/w)+"%\"}")
		}
		else
		{
		json["attr"][i-rs]=JSON.parse("{\"name\": \""+tagM[0][i]+ "\",\"label\": \""+horzLabels[i]+ "\",\"height\": \""+rowHeight[i]+"px\"}")
		}
	}
for (i=cs;i<getCol(txtM,0).length;i++)
	{
		if (optCol==1)
		{
		json["attr"][i-cs]=JSON.parse("{\"name\": \""+tagM[i][0]+ "\",\"label\": \""+horzLabels[i]+ "\",\"height\": \""+rowHeight[i]+"px\"}")
		}
		else
		{
		json["opt"][i-cs]=JSON.parse("{\"name\": \""+tagM[i][0]+ "\",\"label\": \""+vertLabels[i]+ "\",\"width\": \""+Math.round(100*colWidth[i]/w)+"%\"}")
		}
	}

if (optCol==1) 
		{numAttr=getCol(txtM,0).length-cs;numOpt=txtM[0].length-rs}
	else
		{numOpt=getCol(txtM,0).length-cs;numAttr=txtM[0].length-rs}
		

for (i=0;i<numAttr;i++)
	{
	cellStr="{";
	for (j=0;j<numOpt;j++)
		{
		if (optCol==1) 	{curOpt = tagM[0][j+rs];ri=j+rs;ci=i+cs} else {curOpt = tagM[j+cs][0];ri=i+cs;ci=j+rs}
		if (stateM[ci][ri]=="1") {styleStr="closed"} else {styleStr="open"}
		cellStr += "\""+curOpt+"\": "+"{\"var\" : \""+tagM[ci][ri]+"\", \"txt\": \""+txtM[ci][ri]+"\", \"box\": \""+boxM[ci][ri]+"\",\"style\": \""+styleStr+"\"},"
		}
		console.log(cellStr)
		json["cell"][i]=JSON.parse(cellStr.substring(0,(cellStr.length-1))+"}")
	}

//get col and row names

		


colType = ExpRow(top.hiddenFrm.CBCol);
rowType = ExpRow(top.hiddenFrm.CBRow);

// backwards compatibility with version <1.00
// replace type 2 cols and rows with type 1

for (i=0;i<colType.length;i++)
	{if (parseInt(colType[i])==2) {colType[i]=1}}
for (i=0;i<rowType.length;i++)
	{if (parseInt(rowType[i])==2) {rowType[i]=1}}
	
btnFlg = parseInt(top.hiddenFrm.btnFlg);
btnType = top.hiddenFrm.btnType;

btnTxt = ExpRow(top.hiddenFrm.btntxt);
btnTag = ExpRow(top.hiddenFrm.btntag);
btnState = ExpRow(top.hiddenFrm.btnstate);
to_email = top.hiddenFrm.to_email;

colFix = top.hiddenFrm.colFix;
rowFix = top.hiddenFrm.rowFix;
CountCol = ExpRow(top.hiddenFrm.CBCol);
CountRow = ExpRow(top.hiddenFrm.CBRow);

CBpreset = top.hiddenFrm.CBpreset;

CBcolList = new Array();
CBrowList = new Array();

MakeOrder=$("input[name='MakeOrder']:checked").val();

if (MakeOrder)
{	
if (CBpreset)
		{	
		CBordM = copyOfArray(ExpMatrix(top.hiddenFrm.CBord));
		CBcolList = new Array();
		CBrowList = new Array();
		for (i=0;i<CBordM.length;i++)
				{
					CBcolList[i]= new Array();
					for (cols=0;cols<colType.length;cols++)
						{CBcolList[i][cols]=parseInt(CBordM[i][cols]);}
					CBrowList[i]= new Array();
					for (rows=0;rows<rowType.length;rows++)
						{CBrowList[i][rows]=parseInt(CBordM[i][colType.length+rows]);}
				}
		}
		else
		{

	// code if no prespecified CBorder

	// retrieve position of counterbalance groups 

	var cf=new Array()  // position of fixed cols
	var c1=new Array()  // position of c1 cols

	for (var i=0; i<CountCol.length; i++)
		{
		switch (CountCol[i])
			{ 
			case '0': cf[cf.length]=i;break;
			case '1': c1[c1.length]=i;break;
			}
		}

	var rf=new Array()  // position of fixed rows
	var r1=new Array()  // position of c1 rows

	for (var i=0; i<CountRow.length; i++)
		{
		switch (CountRow[i])
			{ 
			case '0': rf[rf.length]=i;break;
			case '1': r1[r1.length]=i;break;
			}
		}

	// subjDen is the denominator used to devide the subj number for each counterbalance step

	

	var numCond = (c1.length>0 ? fac(c1.length) : 1)*(r1.length>0 ? fac(r1.length) : 1);

	
	for (subjnr=0;subjnr<numCond;subjnr++)
	{
	
	
	subjDen = 1;   
	// counterbalance col groups		
	if (c1.length>0) {c1_order=CountBal(subjnr/subjDen+1,c1.length); 
						subjDen = subjDen*fac(c1.length);} 

	var c1count=0;
	CBcolList[subjnr]= new Array();
	for (var i=0; i<CountCol.length; i++)
		{
		switch (CountCol[i])
			{ 
			case '0': CBcolList[subjnr][i]=i;break;
			case '1': CBcolList[subjnr][i]=c1[c1_order[c1count]];c1count++;break;
			}
		}

// counterbalance rows					
if (r1.length>0) {r1_order=CountBal(subjnr/subjDen+1,r1.length); subjDen = subjDen * fac(r1.length);} 

var r1count=0;
CBrowList[subjnr]= new Array();

for (var i=0; i<CountRow.length; i++)
	{
	switch (CountRow[i])
		{ 
		case '0': CBrowList[subjnr][i]=i;break;
		case '1': CBrowList[subjnr][i]=r1[r1_order[r1count]];r1count++;break;
		}
	}
	}

}

if (CBcolList.length>0)
{
	json["optOrders"]=[];
	cStr=[];
	rStr=[];
	for (i=0;i<CBcolList.length;i++)
	{
		
		for (j=rs;j<CBcolList[i].length;j++) {cStr[CBcolList[i][j]-rs]=tagM[0][j]}
		for (j=cs;j<CBrowList[i].length;j++) {rStr[CBrowList[i][j]-cs]=tagM[j][0]}
		optStr = "{\"name\": \"order"+i+"\",\"opt\": "
		if (optCol==1) {optStr+=JSON.stringify(cStr)+",\"attr\":"+JSON.stringify(rStr)+"}"} else {optStr+=JSON.stringify(rStr)+",\"attr\":"+JSON.stringify(cStr)+"}"}
		console.log(optStr)
	json["optOrders"][i]=JSON.parse(optStr);
	json["sets"][0]["optOrder"][i]="order"+i;
	}
	
}
//end of creating orders
}

if (btnFlg) {json["sets"][0]["buttons"]="on"} else {json["sets"][0]["buttons"]="off"}

activeClass = top.hiddenFrm.activeClass;
inactiveClass = top.hiddenFrm.inactiveClass;
boxClass = top.hiddenFrm.boxClass;
cssname = top.hiddenFrm.cssname;
randomOrder = top.hiddenFrm.randomOrder;
nextURL = top.hiddenFrm.nextURL;
expname = top.hiddenFrm.expname;
masterCond = top.hiddenFrm.masterCond;
chkFrm = top.hiddenFrm.chkFrm;
warningTxt = top.hiddenFrm.warningTxt;
evtOpen = (top.hiddenFrm.evtOpen ? top.hiddenFrm.evtOpen : 0);
evtClose = (top.hiddenFrm.evtClose ? top.hiddenFrm.evtClose : 0);

if (tmTotalSec)
{
	tmTotalSec = top.hiddenFrm.tmTotalSec;
	tmStepSec = top.hiddenFrm.tmStepSec;
	tmWidthPx = top.hiddenFrm.tmWidthPx;
	tmFill = top.hiddenFrm.tmFill;
	tmShowTime = top.hiddenFrm.tmShowTime;
	tmCurTime = top.hiddenFrm.tmCurTime;
	tmActive = top.hiddenFrm.tmActive;
	tmDirectStart = top.hiddenFrm.tmDirectStart;
	tmMinLabel = top.hiddenFrm.tmMinLabel;
	tmSecLabel = top.hiddenFrm.tmSecLabel;
	tmLabel = top.hiddenFrm.tmLabel;
}
//if (top.hiddenFrm.document.forms[0].submit) {submitName=top.hiddenFrm.document.forms[0].elements[0].value;} else {submitName="Next Page"}


}
if (tablePresent)
	{
	jsonStr="// here the json file to generate the trial, for a particular set in the json file is generated. If the third attribute is set to random, it will select an order at random.\r\n			// if you enter a number, it will choose one of the orders using modulo of that number\r\n 			// now taking the number from the condnum variable to set the order of the options\r\n            o=$(\"#condnum\").val();\r\n			if (o<0) {o=\"random\"};\r\n           		generateTrial(\"json_files/"+expname+".json\", \"dynSet\", o);\r\n"	
	scripttxt="";
	}
else
	{
		jsonStr="";
		startpos=htmlCode.indexOf("<!--BEGIN set vars-->");
endpos=htmlCode.indexOf("<!--END set vars-->");
if (startpos!=-1) {scripttxt = htmlCode.slice(startpos, endpos)} else {scripttxt=""}
	}
expnamestring="<input type=hidden id=\"expname\" name=\"expname\" value=\""+expname+"\">";
nextURLstring="<input type=hidden name=\"nextURL\" value=\""+nextURL+"\">";
	
docstr=headerStr+"<title>"+windowName+"</title>\r\n"+scriptStr+scripttxt+formStr+expnamestring+"\r\n"+nextURLstring+"\r\n"+emailstring+othervarStr+windowName+"        </header>\r\n        <div id=\"preHTML\" class=\"w3-white w3-container\">\r\n"+preHTML+"\r\n</div>\r\n  <div id=\"container\"  class=\"w3-white w3-container w3-col\" style=\"width:90%\">\r\n            </div>\r\n<div id=\"postHTML\" class=\"w3-white w3-container\">\r\n"+postHTML+"\r\n</div>\r\n"+"<div class=\"w3-white w3-container w3-center w3-padding\">\r\n			<button class=\"confirm w3-button w3-center w3-round-xlarge\" name=\"submit\" value=\"confirm\">"+submitstring+footerStr+jsonStr+endStr;

$("#pagename").val(expname+".php")
$("#pagetxt").val(docstr);

$("#jsonname").val(expname+".json")
$("#jsontxt").val(JSON.stringify(json,null,'\t'));

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
interpreter(json, "dynSet", "random");
}

