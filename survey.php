<?php 
session_start();
if (isset($_GET['subject'])) {$subject=$_GET['subject'];$_SESSION['subject']=$subject;}
 else {
	 if (isset($_SESSION['subject'])) {$subject=$_SESSION['subject'];}
	 else {$subject="anonymous";};
		}
if (isset($_GET['condnum'])) {$condnum=$_GET['condnum'];}
 else {
	 if (isset($_SESSION['condnum'])) {$condnum=$_SESSION['condnum'];$_SESSION['condnum']=$condnum;}
		else {$condnum=-1;};
	}
	
?>
<html>
    <head>
        <title>Survey</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="text/javascript" src="main.js"></script>
        <script type="text/javascript" src="jquery-3.1.1.min.js"></script>
        <script src="jquery.foggy.min.js"></script>
        <script language=javascript src="mlweb20.js"></script>
        <link rel="stylesheet" href="w3.css">
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.0/css/all.css" integrity="sha384-lZN37f5QGtY3VHgisS14W3ExzMWZxybE1SJSEsQp9S+oqd12jhcu+A56Ebc1zFSJ" crossorigin="anonymous">
		
		
	</head>

    <body class="w3-light-grey w3-content" style="max-width:1600px" onLoad="timefunction('onload', 'body', 'body')">
        <!--BEGIN set vars-->
        <script language="javascript">

            //override defaults
            mlweb_outtype = "CSV";
            mlweb_fname = "mlwebform";
            chkFrm = false;
            warningTxt = "Please answer all questions.";
			choice = "";
        </script>


<FORM id="mlwebform" name="mlwebform" onSubmit="return checkForm(this)" method="POST" action="save.php">
 
			<INPUT type=hidden id='processData' name="procdata" value="">
            <!-- set all variables here -->
            <input id="expName" type=hidden name="expname" value="survey">
            <input type=hidden name="nextURL" value="gamble.php">
            <input type=hidden name="to_email" value="">
            <!--these will be set by the script -->
			<input type=hidden name="subject" value="<?php echo($subject)?>">
			<input type=hidden id="condnum" name="condnum" value="<?php echo($condnum)?>">
           <input id="choice" type=hidden name="choice" value="">


        <header class="w3-container w3-blue">
            <h1>MouselabWEB 2.0 Demo</h1>
        </header>
        <div class="w3-white w3-container">

            <h1>Survey</h1>
            <p>Below are some examples of survey questions, using w3.css. By using the label "required" inside the input element, you can set specific elements to be required before the form can be submitted.</p>
			<h2>demon graphics</h2>
			<div class="w3-container">
			<label class="w3-text-blue"><b>First Name</b></label>
			  <input class="w3-input w3-border w3-hover-blue" name="first" type="text"></p>
			  <p>      
			  <label class="w3-text-red"><b>Last Name *</b></label>
			  <input class="w3-input w3-border " name="last" type="text" required></p>
			  <h2>Simple checkbox example</h2>
			<p>Check what you will buy:</p>
						<p><input class="w3-check" type="checkbox" name="milk" checked="checked" >
			<label>Milk</label></p>
			<p><input class="w3-check" type="checkbox" name="sugar" >
			Sugar</p>
			<p><input class="w3-check" type="checkbox" name="lemon" disabled>
			<label>Lemon (Disabled)</label></p>
<H2>Simple radio button question</h2>		
			<p class="w3-text-red">What is your gender?*</p>			 
			 <p><input class="w3-radio" type="radio" name="gender" value="male" required>
			<label>Male</label>
			  
			  <input class="w3-radio" type="radio" name="gender" value="female">
			  <label>Female</label>
			  
			  <input class="w3-radio" type="radio" name="gender" value="" disabled>
			  <label>other (Disabled)</label></p>
	<h2>A set of options to select from*</h2>
	<select class="w3-select w3-border" name="option" required>
    <option value="" disabled selected>Choose your option</option>
    <option value="1">Option 1</option>
    <option value="2">Option 2</option>
    <option value="3">Option 3</option>
  </select>
	<h2>scales example</h2>
	<p>This uses the w3-row elements to make a larger table of survey items</p>
		<div class="w3-row w3-border">
  <div class="w3-container w3-col w3-white w3-left-align w3-large " style="width: 50%;">Please answer the statements below </div>
  <div class="w3-container w3-col w3-gray w3-center" style="width: 10%;" ><b>strongly disagree</b></div>
  <div class="w3-container w3-col w3-white w3-center" style="width: 10%;" ><b>disagree</b></div>
  <div class="w3-container w3-col w3-gray w3-center " style="width: 10%;" ><b>neither disagree/agree</b></div>
  <div class="w3-container w3-col w3-white w3-center" style="width: 10%;" ><b>agree</b></div>
  <div class="w3-container w3-col w3-gray w3-center " style="width: 10%;" ><b>strongly agree</b></div>
</div>
	<div class="w3-row w3-border">
  <div class="w3-container w3-col w3-light-grey w3-left-align w3-hover-blue" style="width: 50%;height: 30px">MouselabWEB is a great tool </div>
  <div class="w3-container w3-col w3-gray w3-center w3-hover-blue" style="width: 10%;" ><input class="w3-radio" type="radio" name="q1" value="-2" > 1</div>
  <div class="w3-container w3-col w3-white w3-center w3-hover-blue" style="width: 10%;" ><input class="w3-radio" type="radio" name="q1" value="-1" > 2</div>
  <div class="w3-container w3-col w3-gray w3-center w3-hover-blue" style="width: 10%;" ><input class="w3-radio" type="radio" name="q1" value="0" > 3</div>
  <div class="w3-container w3-col w3-white w3-center w3-hover-blue" style="width: 10%;" ><input class="w3-radio" type="radio" name="q1" value="1" > 4</div>
  <div class="w3-container w3-col w3-gray w3-center w3-hover-blue" style="width: 10%;" ><input class="w3-radio" type="radio" name="q1" value="2" > 5</div>
</div>
<div class="w3-row w3-border">
  <div class="w3-container w3-col w3-light-grey w3-left-align w3-hover-blue" style="width: 50%;height: 30px" >MouselabWEB is hard to learn</div>
  <div class="w3-container w3-col w3-gray w3-center w3-hover-blue" style="width: 10%;" ><input class="w3-radio" type="radio" name="q2" value="-2" >&nbsp;</div>
  <div class="w3-container w3-col w3-white w3-center w3-hover-blue" style="width: 10%;" ><input class="w3-radio" type="radio" name="q2" value="-1" >&nbsp;</div>
  <div class="w3-container w3-col w3-gray w3-center w3-hover-blue" style="width: 10%;" ><input class="w3-radio" type="radio" name="q2" value="0" >&nbsp;</div>
  <div class="w3-container w3-col w3-white w3-center w3-hover-blue" style="width: 10%;" ><input class="w3-radio" type="radio" name="q2" value="1" >&nbsp;</div>
  <div class="w3-container w3-col w3-gray w3-center w3-hover-blue" style="width: 10%;" ><input class="w3-radio" type="radio" name="q2" value="2" >&nbsp;</div></div>
</div>

	
            <div id="container"  class="w3-white w3-container w3-col" style="width:90%">
            </div>
			
        </div>
		<div class="w3-white w3-container w3-center w3-padding">
			<button class="confirm w3-button w3-center w3-round-xlarge" name="submit" value="confirm">Confirm</button>
		</div>
        <footer class="w3-container w3-blue">
		<h4>(C) Martijn Willemsen and Martijn ter Meulen</h4>
        </footer>
</div>

        <script type="text/javascript">

			// here the json file to generate the trial, for a particular set in the json file is generated. If the third attribute is set to random, it will select an order at random.
			// if you enter a number, it will choose one of the orders using modulo of that number
			// now taking the number from the condnum variable to set the order of the options
            o=$("#condnum").val();
			if (o<0) {o="random"};
            
			//generateTrial("json_files/tv.json", "dynSet", o);

            			
     		//function that starts the page
	$(document).ready(function () { 
		$(".confirm").click(function (event) {
			if (choice=="" && $(".choiceButton").length>0) {event.preventDefault();return false;}           
			});
		});	
	
			

        </script>
    </body>
</html>
