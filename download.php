<?php
if ($_POST['act']=='edit')
{
session_start();
$_SESSION['jsonInput']=$_POST['pagetxt'];	
$host  = $_SERVER['HTTP_HOST'];
$uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
header("Location: http://$host$uri/mouselabEditor.php");
exit;
}
else{
$pagetxt=stripslashes($_POST['pagetxt']);
$pagename = $_POST['pagename'];

header('Content-Type: txt/HTML');
header('Content-Length: ' . strlen($pagetxt));
header('Content-Disposition: attachment; filename="'.$pagename.'"');
echo $pagetxt;
}
?>
