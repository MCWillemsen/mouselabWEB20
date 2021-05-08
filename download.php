<?php
$pagetxt=stripslashes($_POST['pagetxt']);
$pagename = $_POST['pagename'];

header('Content-Type: txt/HTML');
header('Content-Length: ' . strlen($pagetxt));
header('Content-Disposition: attachment; filename="'.$pagename.'"');
echo $pagetxt;
?>
