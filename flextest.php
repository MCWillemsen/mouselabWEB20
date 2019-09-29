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
        <title>Flex</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="text/javascript" src="main.js"></script>
        <script type="text/javascript" src="jquery-3.1.1.min.js"></script>
        <script src="jquery.foggy.min.js"></script>
        <script language=javascript src="mlweb20.js"></script>
        <link rel="stylesheet" href="w3.css">
		
	</head>

    <body class="w3-light-grey w3-content" style="max-width:1600px" onLoad="timefunction('onload', 'body', 'body')">
       

<FORM id="mlwebform" name="mlwebform" onSubmit="return checkForm(this)" method="POST" action="save.php">
 
			<INPUT type=hidden id='processData' name="procdata" value="">
            <!-- set all variables here -->
            <input id="expName" type=hidden name="expname" value="gamble">
            <input type=hidden name="nextURL" value="thanks.html">
            <input type=hidden name="to_email" value="">
            <!--these will be set by the script -->
			<input type=hidden name="subject" value="<?php echo($subject)?>">
			<input type=hidden id="condnum" name="condnum" value="<?php echo($condnum)?>">
           <input id="choice" type=hidden name="choice" value="">


        <header class="w3-container w3-blue">
            <h1>MouselabWEB 2.0 Demo</h1>
        </header>
        <div class="w3-white w3-container">

            <h1>Introduction</h1>
            <p>testing</p>
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
            
			generateTrial("container","json_files/flex.json", "dynSet", o);

            			
     		//function that starts the page
	$(document).ready(function () { 
		$(".confirm").click(function (event) {
			if (choice=="" && $(".choiceButton").length>0) {event.preventDefault();return false;}           
			});
		});	
	
			

        </script>
    </body>
</html>
