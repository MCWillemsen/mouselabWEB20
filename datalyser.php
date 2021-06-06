<?php 
// 	Datalyser: download and replay data from  MouselabWEB database
//
//       v 2.00, Nov 2017
//		adapted for new mysqli and 
//
//     (c) 2004-17 Martijn C. Willemsen and Eric J. Johnson 
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

///////////////////////////////////////////////////////////////////////
// set password 
// adjust password if published on a public website to prevent others
// from downloading your data
$password = "mlweb";
// set a larger memory limit required for processing large files
ini_set('memory_limit', '64M'); 
include('mlwebdb.inc.php');
$glcnt = 0;

function multi2dSortAsc(&$arr, $key1, $key2){ 
  $sort_col1 = array(); 
  $sort_col2 = array(); 
  foreach ($arr as $sub) $sort_col1[] = $sub[$key1]; 
  foreach ($arr as $sub) $sort_col2[] = $sub[$key2]; 
  array_multisort($sort_col1, $sort_col2, $arr); 
}

function extractTag($datastr, $tagstr)
{
//this function returns the content of information that is in between <$tagstr> </$tagstr>
$pos1 = strpos($datastr,"<".$tagstr.">");
$pos2 = strpos($datastr, "</".$tagstr.">");
return substr($datastr, $pos1+strlen($tagstr)+2, $pos2-strlen($tagstr)-2-$pos1);
}

function unfoldEvent($rowarr)
{
// unfold event data
// this unfolds one row in the database (already inputted as a array of data) into a set of events
// output is a header row with field names and a set of rows with all the events present

$opentype = 0; $openevt=array(0=>"mouseover",1=>"click");
$procvars = array();
//add fields to headerarr if first procdata is not empty
$prockey = array_search("procdata",$rowarr[0]);
$procdata = $rowarr[1][$prockey];
if ($procdata!="") 	 	
			{$rowarr[0]=array_merge(array_slice($rowarr[0],0,$prockey),array("event", "name", "value", "time"),array_slice($rowarr[0],$prockey+1));}
	
$outarr[0] = $rowarr[0];		
$procvars = array();		
for ($j=1;$j<count($rowarr);$j++)
	{
	$procdata = $rowarr[$j][$prockey];
	if ($procdata!="") 
			{
			
			if (strpos($procdata, "<?xml")!==false) 
				{
				unset($evtarr,$addrow);
				$eventnum = substr_count($procdata,"<eventblock>");
				$data = substr($procdata, strpos($procdata, "<eventblock>")); // strip everything before first ,<eventblock>
				for ($evt=0;$evt<$eventnum;$evt++)
					{
					$eventstr[$evt]=extractTag($data, "eventblock");
					$evtarr=array(extractTag($eventstr[$evt], "event"),extractTag($eventstr[$evt], "name"), extractTag($eventstr[$evt], "value"), extractTag($eventstr[$evt], "time")) ;
					$addrow[$evt]=array_merge(array_slice($rowarr[$j],0,$prockey),$evtarr,array_slice($rowarr[$j],$prockey+1));
					//echo $evt."|".implode("|",$addrow[$evt])."\n";
					$data = substr($data,strpos($data, "<eventblock>", 2));
					if ($evtarr[0]=='events') {$opentype=substr($evtarr[2],0,1);}
					if (substr($evtarr[0],-4)==substr($openevt[$opentype],-4)) {$procvars=array_merge($procvars,array($evtarr[1]=>0));}					
					}
				}
			elseif (strpos($procdata,"\"")!==false)
				{
				$eventstr = explode("\n",rtrim($procdata));
				unset($evtarr,$addrow);
				$prevevtarr=[];   
				for ($evt=1;$evt<count($eventstr);$evt++)
					{
					$evtarr=explode("\",\"", substr(trim($eventstr[$evt]),1,strlen(trim($eventstr[$evt]))-2));
					if ($evtarr!=$prevevtarr) //clean up: two gazeovers with same time, delete second one
					{
					//if there is a gazeout/over sequence with same time/box then delete (first) out event
					if ($evtarr[0]=="gazeover" && $prevevtarr[0]=="gazeover" && $evtarr[3]==$prevevtarr[3]) {array_pop($addrow);}
					if ($evtarr[0]=="gazeover" && $prevevtarr[0]=="gazeout" && $evtarr[2]==$prevevtarr[2] && $evtarr[3]==$prevevtarr[3]) {array_pop($addrow);}
					//otherwise good to go and add the event to the list
					$addrow[]=array_merge(array_slice($rowarr[$j],0,$prockey),$evtarr,array_slice($rowarr[$j],$prockey+1));
					}
					//echo $evt."|".implode("|",$addrow[$evt])."\n";
					if ($evtarr[0]=='events') {$opentype=substr($evtarr[2],0,1);}
					if (substr($evtarr[0],-4)==substr($openevt[$opentype],-4)) {$procvars[$evtarr[1]]=0;}			
					$prevevtarr = $evtarr; 							
					}
				}
			}
			else
			{
			$addrow[0] = $rowarr[$j];
			}
	$outarr = array_merge($outarr, $addrow); 
	}
return array($outarr,$procvars);
}

function unpackProc($procdata)
{
// unfold event data for playback (just process data)
	
if ($procdata=="") 	return false;
	
if (strpos($procdata, "<?xml")!==false) 
				{
				$eventnum = substr_count($procdata,"<eventblock>");
				$data = substr($procdata, strpos($procdata, "<eventblock>")); // strip everything before first ,<eventblock>
				for ($evt=0;$evt<$eventnum;$evt++)
					{
					$eventstr=extractTag($data, "eventblock");
					$evtarr[$evt]=array(extractTag($eventstr, "event"),extractTag($eventstr, "name"), extractTag($eventstr, "value"), extractTag($eventstr, "time")) ;
					$data = substr($data,strpos($data, "<eventblock>", 2));
					}
				}
			elseif (strpos($procdata,"\"")!==false)
				{
				$eventstr = explode("\n",rtrim($procdata));
				$prevevtarr=[];   
				for ($evt=1;$evt<count($eventstr);$evt++)
					{
					$evtarr=explode("\",\"", substr(trim($eventstr[$evt]),1,strlen(trim($eventstr[$evt]))-2));
					if ($evtarr!=$prevevtarr) //clean up: two gazeovers with same time, delete second one
					{
					//if there is a gazeout/over sequence with same time/box then delete (first) out event
					if (substr($evtarr[0],-4)=="over" && substr($prevevtarr[0],-4)=="over" && $evtarr[3]==$prevevtarr[3]) {array_pop($evtarr_proc);}
					if (substr($evtarr[0],-4)=="over" && substr($prevevtarr[0],-3)=="out" && $evtarr[2]==$prevevtarr[2] && $evtarr[3]==$prevevtarr[3]) {array_pop($evtarr_proc);}
					//otherwise good to go and add the event to the list
					$evtarr_proc[]=$evtarr;
					}
					$prevevtarr = $evtarr;
					}
				}
return $evtarr_proc;
}

function ExpfromDB($nameofexp,$table)
{
global $link;
// get first experiment data
$sqlQuery = "SELECT * from $table where expname='".$nameofexp."'";

    # Execute SQL query 
    $result=mysqli_query($link,$sqlQuery) or die("Invalid Query : ".mysqli_error($link)); 
    $row=mysqli_fetch_array($result); 
    # Check whether NULL records found 
    if(!mysqli_num_rows($result)) die("No records found.XXX"); 

	$rowarr[0] = array();
	$i=0;
	$vararr = array();
	$vararr[0] = array();
	$varlistarr = array();
	# Make the headerrow with table column names 
    foreach($row as $key => $value) 
    { 
        $i++; 
        if(!($i%2)) 
			# explode additional vars for this experiment 
			# note that this routine assumes the addvar list is the same for all rows with this expname
    	    if ($key=="addvar") {//$newvararr=explode(";",$value);$last = array_pop($newvararr);
			}
			 
	       else if ($key!="adddata") {$rowarr[0][]=$key;}
  	} 
		
	// Get all rows 
    $result=mysqli_query($link, $sqlQuery);
	// j is the index of the rowarr, a two dimension array that contains all rows of data
    $j=1;
	while ($row = mysqli_fetch_array($result)) 
		{
        $i=0;
		foreach($row as $key => $value)
    		{ 
        	$i++; 
	        if(!($i%2)) 
			# explode additional vars for this experiment 
    	    if ($key=="adddata") {$newdataarr=explode(";",str_replace(chr(34),'',$value));$last = array_pop($newdataarr);}
			else if ($key=="addvar") {$newvararr=explode(";",$value);$last = array_pop($newvararr);}
			else {$rowarr[$j][]=$value;}
  			}
		//update varlist with possible new added variables
		foreach ($newvararr as $key => $value)
			{
			$varlistarr[$value]=0;
			}
		foreach ($newvararr as $key => $value) 
						{$vararr[$j][$value] = $newdataarr[$key];} 
		$j++;
		} 

foreach ($varlistarr as $key => $value) 	
			{
			// add varnames at top row and update varlst with column positions
			$rowarr[0][]=$key;
			$varlistarr[$key]=count($rowarr[0]);
			}
			
for ($j=1;$j<count($rowarr);$j++)
		{
			//enter the value for each added var into the right column, using mapping from varlistarr
			foreach ($varlistarr as $key => $value) 	
			{
			$rowarr[$j][$value]=$vararr[$j][$key];
			}
		}
return $rowarr;
}

if(isset($_POST['act'])) 
{ // start action part (caused by a submitted form)

	// get action
	$act = $_POST['act'];
	$pwd = $_POST['pwd'];
	if ($pwd!=$password) {die("incorrect password");}
	
	if ($act=="download") 
		// action is download
		{
		$i=0;
		//get all post variables that indicate experiment numbers
		foreach ($_POST as $key => $value) { 
		 if (substr($key,0,4)=="exp_") {$arr[$i]=$value;$i++;}
    		}

		for ($expcount=0;$expcount<count($arr);$expcount++) 
		// make datafile for each experiment
			{
			$outstr="";

			$rowarr = ExpfromDB($arr[$expcount],$table);
			//if ($_POST['unpack']==="true") $outarr = unfoldEvent($rowarr); else $outarr = $rowarr;
	
			for ($j=0;$j<count($rowarr);$j++)
				{ 
				if ($_POST['unpack']==="true") 
						{
						 if ($j>0) $temprow=array($rowarr[0],$rowarr[$j]); else $temprow=array($rowarr[0],$rowarr[1]);
						 list($temprow2,$procvars) = unfoldEvent($temprow); 
						 if ($j>0) {
						 			$outrow = array_slice($temprow2,1);
									for ($z=0;$z<count($outrow);$z++)
										{
										$outstr.="\"".implode("\",\"",$outrow[$z])."\"\n";
										}	
									}
									else 
									{$outrow= $temprow2[0];
									$outstr.="\"".implode("\",\"",$outrow)."\"\n";
									}
							}
					else 
						{$outrow = $rowarr[$j];
						$outstr.="\"".implode("\",\"",$outrow)."\"\n";}
			
				
				}

			$filename = 'tmp/'.$arr[$expcount].".csv";

			if (!$handle = fopen($filename, 'w+')) {
				die("Cannot open file ($filename)");
				exit;}

			if (!fwrite($handle, $outstr)) {
				die("Cannot write to file ($filename)");
				exit;}
		
			fclose($handle);
  
			} //end of for loop going through experiments
?>
<HTML>
<HEAD>
<TITLE>MouselabWEB Datalyser</TITLE>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="w3.css">
</HEAD>
<body class="w3-light-grey w3-content" style="max-width:1600px">
<header class="w3-container w3-blue">
<H1>MouselabWEB Datalyser</H1>
</header>
<div class="w3-white w3-container">
<H1>Links to CSV files for selected experiments</H1>
<Table class="w3-table-all">
<?php 
for ($expcount=0;$expcount<count($arr);$expcount++)
{
$filename = 'tmp/'.$arr[$expcount].".csv";
echo ("<TR><TD>$arr[$expcount]</TD><TD><a href=\"$filename\">$filename</a></TD></TR>");
}
?>
</table>
</div>
<footer class="w3-container w3-blue">
		<h4>(C) Martijn Willemsen</h4>
        </footer>
</BODY>
</HTML>
<?php
		} // end of download part
		if ($act=="process") 
		// action is process
		{
		$i=0;
		$opentype = 0; $openevt=array(0=>"mouseover",1=>"click");
		$closetype = 0; $closeevt=array(0=>"mouseout",1=>"click",2=>"click",3=>"-");

		//get all post variables that indicate experiment numbers
		foreach ($_POST as $key => $value) { 
		 if (substr($key,0,4)=="exp_") {$arr[$i]=$value;$i++;}
    	 if ($key=="threshold") {$th=round($value);}
		 if ($key=="divisions") {$division=round($value);}
		 		}

		for ($expcount=0;$expcount<count($arr);$expcount++) 
		// make datafile for each experiment
			{
			$outstr="";
			$delay=0;
			$outrow=array();
			$freqvar = array();
			$timevar = array();
			$outrow_s = array();
			$glprocvars=array(); // this array is used to save names of the boxes to count the process vars...
			$gladdvars=array(); 
			$glproccount=array();
			$gldelay=array();				
			$rowarr = ExpfromDB($arr[$expcount],$table);
			for ($j=0;$j<count($rowarr);$j++)
				{ 
				$colord="";
				$roword="";
				$evttype="0_0";
				$gladdvars[$j]=array();
				$glcnt++;
				$temprow=array($rowarr[0],$rowarr[$j+1]); 
				//print_r($rowarr[0]);
				list($temprow2,$procvars) = unfoldEvent($temprow); 
				if ($j==0) {
							
							foreach ($temprow2[0] as $key => $value) 
											{if ($value=="event") $eventKey=$key;	
											 if ($value=="time") $timeKey = $key;} 
							/*if (array_merge($glprocvars, $procvars)!=$glprocvars)
								{
								$noAddVar = count($glprocvars);
								$glprocvars=array_merge($glprocvars,$procvars);
								}	
							*/	
							$outrow[0]=array_merge(array_slice($temprow2[0],0,$timeKey-2),array("roword" => "roword", "colord" => "colord","evttype" => "evttype","boxname" => "boxname","boxin" => "boxin","boxtime" => "boxtime","delay" => "delay", "counter" => "counter"), array_slice($temprow2[0],$timeKey+1));
							
							}
				$localcount=0;
				$outrowtmp = array();
				for ($c=1;$c<count($temprow2);$c++)
						{
						if (substr($temprow2[$c][$eventKey],-3)==substr($closeevt[$closetype],-3))
						// a close event!
								{
								$boxname=$temprow2[$c][$eventKey+1];
								if ($glprocvars[$boxname]==0)
									{
									if ($opentype==1 & $closetype>0)
										{//generate open event because this click was from an open click 
										$boxname=$temprow2[$c][$eventKey+1];
										$glprocvars[$boxname]=$temprow2[$c][$eventKey+3]-$starttime;
										$localcount++;
										$glproccount[$boxname]=$localcount;
										if (substr($temprow2[$c][$eventKey+2],0,2)=="d=") $gldelay[$boxname]=intval(substr($temprow2[$c][$eventKey+2],2)); else $gldelay[$boxname]=0;
										}
									}
									else
									{
									$boxendtime=$temprow2[$c][$eventKey+3]-$starttime;
									$boxtime=$temprow2[$c][$eventKey+3]-$starttime-$glprocvars[$boxname];
									if ($boxtime>$th) 
										{																			
										$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], $boxtime-$gldelay[$boxname], $gldelay[$boxname]));
										}
									$glprocvars[$boxname]=0;
									$glproccount[$boxname]=0;
									$gldelay[$boxname]=0;
									}
								}
						else if (substr($temprow2[$c][$eventKey],-4)==substr($openevt[$opentype],-4))
						// an open event!
								{
								$boxname=$temprow2[$c][$eventKey+1];
			
								if ($glprocvars[$boxname]==0) 
										{$glprocvars[$boxname]=$temprow2[$c][$eventKey+3]-$starttime;
										$localcount++;
										$glproccount[$boxname]=$localcount;
										if (substr($temprow2[$c][$eventKey+2],0,2)=="d=") $gldelay[$boxname]=intval(substr($temprow2[$c][$eventKey+2],2)); else $gldelay[$boxname]=0;
										}
										else 
										{
										// there was already a time so close this event
										$boxendtime=$temprow2[$c][$eventKey+3]-$starttime;
										$boxtime=$temprow2[$c][$eventKey+3]-$starttime-$glprocvars[$boxname];
										$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], $boxtime-$delay, $delay));
									$glprocvars[$boxname]=0;
									$glproccount[$boxname]=0;
									$gldelay[$boxname]=0;
										}
								if ($closetype==3) 
											{																			
											// no close event, write events with no time directly
											$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], 0, $gldelay[$boxname]));
									$glprocvars[$boxname]=0;
									$glproccount[$boxname]=0;
									$gldelay[$boxname]=0;
											}
								}
						else if (substr($temprow2[$c][$eventKey],-4)=="over" & $openevt[$opentype]!="mouseover")
								{
								//this must be an mouseover on another form element
								// set an open time for this element
								$boxname=$temprow2[$c][$eventKey+1];
								if (substr($temprow2[$c][$eventKey+2],0,2)=="d=") $gldelay[$boxname]=intval(substr($temprow2[$c][$eventKey+2],2)); else $gldelay[$boxname]=0;
								$glprocvars[$boxname]=$temprow2[$c][$eventKey+3]-$starttime;
								$localcount++;
								$glproccount[$boxname]=$localcount;
								}
						else if ($temprow2[$c][$eventKey]=="onclick")
								{
								//this must be an click on another form element
								$boxname=$temprow2[$c][$eventKey+1];
								$localcount++;
								$glproccount[$boxname]=$localcount;
								if (substr($temprow2[$c][$eventKey+2],0,2)=="d=") $gldelay[$boxname]=intval(substr($temprow2[$c][$eventKey+2],2)); else $gldelay[$boxname]=0;
								if ($glprocvars[$boxname]==0) 
								// generate a click event without time if there was no time registered
										{$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], 0, $gldelay[$boxname]));
									$glprocvars[$boxname]=0;
									$glproccount[$boxname]=0;
									$gldelay[$boxname]=0;
										}
										else 
										{
										// there was already a time so close this event
										// for example, this registers the total time needed for clicking on a button after a mouseover event occurred (measure for deliberation time?)
										$boxendtime=$temprow2[$c][$eventKey+3]-$starttime;
										$boxtime=$temprow2[$c][$eventKey+3]-$starttime-$glprocvars[$boxname];
										$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], $boxtime-$gldelay[$boxname],$gldelay[$boxname]));
									$glprocvars[$boxname]=0;
									$glproccount[$boxname]=0;
									$gldelay[$boxname]=0;
										}
								}
							else if (substr($temprow2[$c][$eventKey],-3)=="out" & $closeevt[$closetype]!="mouseout")
								{
								//this must be an hover on another form element
								$boxname=$temprow2[$c][$eventKey+1];
								if ($glprocvars[$boxname]>0) 
										{
										// there was already a time so close this event
										// for example, this registers the total time needed for hovering over a button after a mouseover event occurred (measure for deliberation time?)
										$boxendtime=$temprow2[$c][$eventKey+3]-$starttime;
										$boxtime=$temprow2[$c][$eventKey+3]-$starttime-$glprocvars[$boxname];
										$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], $boxtime-$gldelay[$boxname],$gldelay[$boxname]));
									$glprocvars[$boxname]=0;
									$glproccount[$boxname]=0;
									$gldelay[$boxname]=0;
										}
								}		
								
						if ($temprow2[$c][$eventKey]=="events")
								{$opentype=substr($temprow2[$c][$eventKey+2],0,1);
								 $closetype=substr($temprow2[$c][$eventKey+2],2,1);
								$evttype=$temprow2[$c][$eventKey+2];
								}
						if ($temprow2[$c][$eventKey]=="order")
								{
								if ($temprow2[$c][$eventKey+1]=="col") $colord=$temprow2[$c][$eventKey+2];
								if ($temprow2[$c][$eventKey+1]=="row") $roword=$temprow2[$c][$eventKey+2];
								}
						if ($temprow2[$c][$eventKey]=="onload")
								{
								$starttime=$temprow2[$c][$eventKey+3];
								}
						if ($temprow2[$c][$eventKey]=="submit")
								{
								$endtime=$temprow2[$c][$eventKey+3];
								}											
											
									}	
							foreach ($glprocvars as $key => $value)
									{
									// time for all boxes still open at the end of the experiment
									if ($glprocvars[$key]>0)
										{
										$boxendtime=$endtime-$starttime;
										$boxtime=$boxendtime-$glprocvars[$key];
										if ($boxtime>$th) 
											{																			
											//$outrow[]=array_merge($temprow2[count($temprow)], array($roword, $colord, $evttype, $key, $glprocvars[$key], $boxtime, $localcount));
											$outrowtmp[$glproccount[$key]]=array_merge(array_slice($temprow2[$c-1],0,$timeKey-2), array($roword, $colord, $evttype, $key, $glprocvars[$key], $boxtime, 0));
											}
										$glprocvars[$key]=0;	
										$glproccount[$key]=0;
										}	
									}
						$i=1;		
				ksort($outrowtmp);
				foreach ($outrowtmp as $key => $value)
						{
						$outrow[] = array_merge($outrowtmp[$key], array($i), array_slice($temprow2[$c-1],$timeKey+1));
						$i++; 
						}		
					}	
			
			

$i=0;

			// search for keys of relevant fields
			foreach ($outrow[0] as $key => $value)
					{
					if ($key=="boxname") {$nameKey = $i;}
					if ($key=="boxtime") {$timeKey = $i;}
					if ($key=="counter") {$counterKey = $i;}
					if ($key=="boxin") {$boxinKey = $i;}
					$i++;
					}

		// generate array with numerical indexes for all the fields that have to be added
			
			$outrow[0][]="relcount"; 
			$relcountKey = count($outrow[0])-1;
			$outrow[0][]="maxcount";
			$pos=count($outrow[0]);
			$i=0;
			foreach ($glprocvars as $key => $value)
					{
					$freqvar[$key]=$pos+$i;
					$timevar[$key]=$pos+count($glprocvars)+$i;
					$i++;
					}
			// create header row with field tags
			foreach ($freqvar as $key => $value)
							 {$outrow[0][$value]="f_".$key;} 
			foreach ($timevar as $key => $value)
							{$outrow[0][$value]="t_".$key;} 

			$startCounter=true;	
			$maxcount = 1;			
			// create freq and time data for each field, and calculate relative count
			// trick: walk trough file in backward order to know the maxcount of each trial
			for ($z=count($outrow)-1;$z>0;$z--)
						{
						if ($startCounter) {$maxcount=$outrow[$z][$counterKey];} 
						$outrow[$z][]=$outrow[$z][$counterKey]/$maxcount;
						$outrow[$z][]=$maxcount;
						if ($outrow[$z][$counterKey]==1) {$startCounter=true;} else {$startCounter=false;}
						
						foreach ($freqvar as $key => $value)
							{
							if ($outrow[$z][$nameKey]==$key) {$outrow[$z][$value]=1;} else {$outrow[$z][$value]=0;}
							}
						    foreach ($timevar as $key => $value)
							{
							if ($outrow[$z][$nameKey]==$key) {$outrow[$z][$value]=$outrow[$z][$timeKey];} else {$outrow[$z][$value]=0;}
							}	
						
						}	
						
			//generate all events file
			for ($z=0;$z<count($outrow);$z++) {$outstr.="\"".implode("\",\"",$outrow[$z])."\"\n";	}					
			$filename = 'tmp/'.$arr[$expcount]."_proc.csv";

			if (!$handle = fopen($filename, 'w+')) {
				die("Cannot open file ($filename)");
				exit;}

			if (!fwrite($handle, $outstr)) {
				die("Cannot write to file ($filename)");
				exit;}
		
			fclose($handle);
			$outstr="";
			$outrow_s = array();
		
			//generate summarized file
			//generate first row
			$outrow_s[0]=array_merge(array_slice($outrow[0],0,$nameKey-1), array("div"), array_slice($outrow[0],$timeKey+2));
			$z=0;							
			$tempdata = array();
			$tempdata[1] = array();
			
			while ($z<count($outrow)-1) 
				{
					// create several empty rows with data for each division
					for ($d=1;$d<=$division;$d++)
						{
						for($i=0;$i<(count($outrow[$z])-$pos);$i++)
							{$tempdata[$d][$i] = 0;}
						}
						
					do 
						{
						// for each row of output, put it in the appropriate division row
						// .001 substracted to get the last item for each division within it's borders
						$z++;
						$d = floor(($outrow[$z][$relcountKey]-.001)*$division)+1;
						for($i=0;$i<(count($outrow[$z])-$pos);$i++)
							{$tempdata[$d][$i] = $tempdata[$d][$i]+$outrow[$z][$pos+$i];}
						} 
					while ($outrow[$z][$relcountKey]<1);				
					
					for ($d=1;$d<=$division;$d++)
					{
					$outrow_s[]=array_merge(array_slice($outrow[$z],0,$nameKey-1), array($d), array_slice($outrow[$z],$timeKey+2, $pos-$timeKey-2), $tempdata[$d]);
					}
				}
			
	
			//generate summary file
			// first get keys for dropping irrelevant columns
			$c=0;
			foreach ($outrow_s[0] as $key => $value)
				{
				if ($value=="event") {$evtCol=$c;}
				if ($value=="relcount") {$relCol=$c;}
				$c++;
				}
			
			for ($z=0;$z<count($outrow_s);$z++) 
			{
			$outarr = array_merge(array_slice($outrow_s[$z],0,$evtCol),array_slice($outrow_s[$z],$evtCol+1,$relCol-$evtCol-1), array_slice($outrow_s[$z],$relCol+1));
			$outstr.="\"".implode("\",\"",$outarr)."\"\n";	
			//old code with all columns: $outstr.="\"".implode("\",\"",$outrow_s[$z])."\"\n";	
			
			}		
					
			$filename = 'tmp/'.$arr[$expcount]."_proc_sum".$division.".csv";

			if (!$handle = fopen($filename, 'w+')) {
				die("Cannot open file ($filename)");
				exit;}

			if (!fwrite($handle, $outstr)) {
				die("Cannot write to file ($filename)");
				exit;}
		
			fclose($handle);
			
		
  			$outstr="";
			$outrow_s=array();
			$outrow = array();
			} //end of for loop going through experiments

?>
<HTML>
<HEAD>
<TITLE>MouselabWEB Datalyser</TITLE>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="w3.css">
</HEAD>
<body class="w3-light-grey w3-content" style="max-width:1600px">
<header class="w3-container w3-blue">
<H1>MouselabWEB Datalyser</H1>
</header>
<div class="w3-white w3-container">
<H1>Links to processed CSV files for selected experiments</H1>
<Table class="w3-table-all">
<thead class="w3-light-blue"><tr><tH>Experiment</tH><th>all events</th><th>summarized by division</th></tr></thead>
<?php 
for ($expcount=0;$expcount<count($arr);$expcount++)
{
$filename1 = 'tmp/'.$arr[$expcount]."_proc.csv";
$filename2 = 'tmp/'.$arr[$expcount]."_proc_sum".$division.".csv";
echo ("<TR><TD>$arr[$expcount]</TD><TD><a href=\"$filename1\">$filename1</a></TD><TD><a href=\"$filename2\">$filename2</a></TD></TR>");
}
?>
</table>

</div>
<footer class="w3-container w3-blue">
		<h4>(C) Martijn Willemsen</h4>
        </footer>
</BODY>
</HTML>
<?php
	} // end of process part
	if ($act=="show") 
		{
		//start if show part
		$expname = $_POST['expname'];
		$outstr="";

		$rowarr = ExpfromDB($expname,$table);
			//if ($_POST['unpack']==="true") $outarr = unfoldEvent($rowarr); else $outarr = $rowarr;
			for ($j=0;$j<count($rowarr);$j++)
				{ 
				if ($_POST['unpack']==="true") 
						{
						 if ($j>0) $temprow=array($rowarr[0],$rowarr[$j]); else $temprow=array($rowarr[0],$rowarr[1]);
						 list($temprow2,$procvars) = unfoldEvent($temprow); 
						 if ($j>0) {
						 			
									$outrow = array_slice($temprow2,1);
									for ($z=0;$z<count($outrow);$z++)
										{
										$outstr.="<TR>";
										for ($i=0;$i<count($outrow[$z]);$i++)
											{
											if ($outrow[$z][$i]=="") $outstr.="<TD>&nbsp;</TD>"; 
						 				else $outstr.="<TD>".htmlspecialchars($outrow[$z][$i])."</TD>";
											}	
										$outstr.="</TR>";
										}
									}									
									else 
									{
									
									$outrow= $temprow2[0];
									$outstr.="<thead><TR>";
									for ($z=0;$z<count($outrow);$z++)
										{
										if ($outrow[$z]=="") $outstr.="<TH>&nbsp;</TH>"; 
						 				else $outstr.="<TH>".htmlspecialchars($outrow[$z])."</TH>";
										}	
										$outstr.="</TR></thead>";
											
									}
						}
					else 
						{
						$outrow = $rowarr[$j];
						
							$outstr.="<TR>";
									for ($z=0;$z<count($outrow);$z++)
										{
										if ($j==0)
										{
											if ($outrow[$z]=="") $outstr.="<TH>&nbsp;</TH>"; 
						 				else $outstr.="<TH>".htmlspecialchars($outrow[$z])."</TH>";
										}	
										else
										{
										if ($outrow[$z]=="") $outstr.="<TD>&nbsp;</TD>"; 
						 				else $outstr.="<TD>".htmlspecialchars($outrow[$z])."</TD>";
										}
										}	
										$outstr.="</TR>";
										
						}
				}
	?>
<HTML>
<HEAD>
<TITLE>MouselabWEB Datalyser</TITLE>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="w3.css">
</HEAD>
<body class="w3-light-grey w3-content" style="max-width:1600px">
<header class="w3-container w3-blue">
<H1>MouselabWEB Datalyser</H1>
</header>
<div class="w3-white w3-container">
<H1>Results of Experiment <?php echo($expname);?></H1>
<Table class="w3-table-all w3-tiny w3-hoverable">
<?php echo($outstr); ?> 
</table>
</div>
<footer class="w3-container w3-blue">
		<h4>(C) Martijn Willemsen</h4>
        </footer>
</BODY>
</HTML>
<?php
	} // end of show part
	if ($act=="play") 
		{// start of play part
		$expname = $_POST['expname'];
		
	$sqlQuery = "SELECT id, subject, submitted, procdata, condnum, choice, addvar, adddata from $table where expname='$expname'";

    # Execute SQL query 
    $result=mysqli_query($link, $sqlQuery) or die("Invalid Query : ".mysqli_error($link)); 
    
    # Check whether NULL records found 
    if(!mysqli_num_rows($result)) 
        die("No records found.XX"); 
	$i=0;	
	// get subject data from database and unpack events
	while($rec=mysqli_fetch_row($result)) 
    	{ 	
		
		$dataarr=explode(";",str_replace(chr(34),'',$rec[7]));$last = array_pop($dataarr);
		$vararr=explode(";",$rec[6]);$last = array_pop($vararr);
		$rowarr[$i] = array($rec[0], $rec[1], $rec[2], $rec[4], $rec[5], $dataarr[array_search("optionOrder",$vararr)], $dataarr[array_search("attributeOrder",$vararr)], $dataarr[array_search("jsonfile",$vararr)], $dataarr[array_search("set",$vararr)]);
		$procarr[$i] = unpackProc($rec[3]);
		if ($procarr[$i] !== FALSE) $i++; // only put subjects in the list with process data
		}
    ?>
<HTML>
<HEAD>
<TITLE>MouselabWEB Datalyser</TITLE>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="w3.css">
<script language="javascript">
function objEvent(event,name,value,time)
{
this.event=event
this.name=name
this.value=value
this.time=time
}
function showData(formlink)
{
if (formlink.subj.value!="")
	{idnum = parseInt(formlink.subj.value);
//generate procdata string
procstr="";
for (i=0;i<proc[idnum].length;i++)
	{procstr +=(proc[idnum][i].event+"                ").substr(0,12)+" | "+(proc[idnum][i].name+"              ").substr(0,15)+" | "+(proc[idnum][i].value+"                              ").substr(0,30)+" | "+(proc[idnum][i].time+"        ").substr(0,6)+"\n";}
formlink.proctxt.value = procstr;
	}
	else return false;
}
id = new Array();
subj = new Array();
subm = new Array();
proc = new Array();
choice = new Array();					 
condnum = new Array();
numevents = new Array();
optorder = new Array();
attrorder = new Array();
json = new Array();
set = new Array();
<?php
for ($i=0;$i<count($rowarr);$i++)
    { 	
	echo("id[".$i."]=".$rowarr[$i][0].";\nsubj[".$i."]=\"".$rowarr[$i][1]."\";\nsubm[".$i."]=\"".$rowarr[$i][2]."\";\ncondnum[".$i."]=".$rowarr[$i][3].";\nchoice[".$i."]=\"".$rowarr[$i][4]."\";\n");
	echo("optorder[".$i."]=\"".$rowarr[$i][5]."\";\nattrorder[".$i."]=\"".$rowarr[$i][6]."\";\njson[".$i."]=\"".$rowarr[$i][7]."\";\nset[".$i."]=\"".$rowarr[$i][8]."\";\n");
	
	echo("numevents[".$i."]=".count($procarr[$i]).";\n");
	echo("proc[$i] = new Array();");	
	for($j=0;$j<count($procarr[$i]);$j++)
		{
		echo("proc[$i][$j] = new objEvent;\n");
		echo("proc[$i][$j].event = \"".$procarr[$i][$j][0]."\";\nproc[$i][$j].name =\"".$procarr[$i][$j][1]."\";\nproc[$i][$j].value = \"".$procarr[$i][$j][2]."\";\nproc[$i][$j].time =". $procarr[$i][$j][3].";\n");
		}
	}
?>
function playData()
{
if (document.forms[0].subj.value!="")
	{
	idnum = parseInt(document.forms[0].subj.value);
	playArray = new Array();
	for (i=0;i<numevents[idnum];i++)
		{playArray[i] = proc[idnum][i];}
	playexp = json[idnum];
	playset= set[idnum];
	playcondnum = condnum[idnum];
	playchoice = choice[idnum];		
	var newWind=window.open("playback.html","Playback","height="+(screen.availHeight-60).toString()+",width="+(screen.availWidth-30).toString() +",scrollbars,status,resizable, left=2, top=2");
	newWind.focus();
	}
}
</script>
</head>
<body class="w3-light-grey w3-content" style="max-width:1600px">
<header class="w3-container w3-blue">
<H1>MouselabWEB Datalyser</H1>
</header>
<div class="w3-white w3-container">
<H1>Playback for experiment: <?php echo($expname);?></H1>
<form>
<table><TR><TD><P>Subject selection</P><select name="subj" onChange="showData(this.form)" ><option value="">Select subject</option> 
<?php 
for ($i=0;$i<count($rowarr);$i++)
    { 	
	echo("<option value=\"$i\">".$rowarr[$i][0]."|".$rowarr[$i][1]."|".$rowarr[$i][2]."</option>");
	}
?>
</select></TD>
<TD><P>Process data of current subject</P><textarea name="proctxt" cols=80 rows=10 style="font-family:courier;font-size: 12px;"></textarea></TD></TR></table>
<input type="button" onClick="playData()" value="Playback Data">
<p><strong>Note:</strong>The Replay routine assumes that the data you want to replay has uses the json file as in the dataset based on condnum of that participant. </p>
</form>
</div>
<footer class="w3-container w3-blue">
		<h4>(C) Martijn Willemsen</h4>
        </footer>
</BODY>
</HTML>
<?php


		}// end of playback

} // end of action part  
  else 
{
// startup code for making a selection (if form is not submitted, first opening)
  

$sqlQuery = "SELECT DISTINCT expname from $table";

    # Execute SQL query 
    $result=mysqli_query($link,$sqlQuery) or die("Invalid Query : ".mysqli_error($link)); 
    
    # Check whether NULL records found 
    if(!mysqli_num_rows($result)) 
        die("No records found.XX"); 

?>
<HTML>
<HEAD>
<TITLE>MouselabWEB Datalyser</TITLE>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="w3.css">
<script language="javascript">
function show(exp1)
{
if (document.forms[0].pwd.value=="") {alert("First type your password!");return;}
document.forms[0].act.value="show";
document.forms[0].expname.value=exp1;
document.forms[0].submit();
}
function replay(exp1)
{
if (document.forms[0].pwd.value=="") {alert("First type your password!");return;}
document.forms[0].act.value="play";
document.forms[0].expname.value=exp1;
document.forms[0].submit();
}
function download()
{
if (document.forms[0].pwd.value=="") {alert("First type your password!");return;}
document.forms[0].act.value="download";
document.forms[0].submit();
}
function process()
{
if (document.forms[0].pwd.value=="") {alert("First type your password!");return;}
document.forms[0].act.value="process";
document.forms[0].submit();
}

</script>
</HEAD>
<body class="w3-light-grey w3-content" style="max-width:1600px">
<header class="w3-container w3-blue">
<H1>MouselabWEB Datalyser</H1>
</header>
<div class="w3-white w3-container">
<P><strong>Part of MouselabWEB, version 2</strong></P>
<form method="post" action="datalyser.php">
<input type="hidden" name="act" value="">
<input type="hidden" name="expname" value="">
<P>
This screen enables you to download data in CSV (comma separated values) format. 
This is a textfile format in which each field is enclosed in brackets (") and separated by commas. Such a file can be read by most statistical programs. If the <strong>unpack events</strong> box is checked, the program will unpack the process data (whether it is in XML or CSV format in the database) into a list of events. 
</P>
<p>The <strong>download and process selected</strong> button allows to download processed data that can be analyzed directly. It will delete acquisitions below the threshold, will calculate time and frequency columns for each box on the screen, and will summarize data in divisions.</p>
<p>The <strong>Show Table</strong> button allows you to look at the data in one table, either unpacked or as is. The <strong>Playback</strong> allows for playback of participants in one of the experiments. This button wil open a new page in which you can select a participant from the list.</p>
<P>
<strong>Password:</strong> For any action you do on this page, a password is required. Type the password before pressing a button. This prevents unauthorized users that browse to this page from actually reading your data!
</P>
<div class="w3-row">
<div class="w3-twothird w3-container">
<table class="w3-table-all w3-hoverable">
<thead><TR class="w3-light-blue"><TH>Experiment name</TH><TH>Select<input type=button value="all" onClick="selecting(1);"> <input type=button value="Reset" onClick="selecting(2);"> <input type=button value="Inv" onClick="selecting(3)"></TH><TH>Show data</TH><TH>Play back</TH></TR></thead>
<?php
	// Make rows for records 
    while($rec=mysqli_fetch_row($result)) 
    { 
        echo "<TR><TD>$rec[0]</TD><TD align=center><input type=checkbox name=\"exp_$rec[0]\" value=\"$rec[0]\" CHECKED><TD><input type=button value=\"Show Table\" onClick=\"show('$rec[0]')\"></TD><TD>";
		// check if there is any process data before creating a play back button
		$playstr="&nbsp;";
		$sqlQuery = "SELECT procdata from $table where expname='$rec[0]'";
	    # Execute SQL query 
   		$res2=mysqli_query($link,$sqlQuery) or die("Invalid Query : ".mysqli_error($link)); 
		while($rec2=mysqli_fetch_row($res2)) 
    		{
			if ($rec2[0]!="") {$playstr = "<input type=button value=\"Replay\" onClick=\"replay('$rec[0]')\">"; break;}
			}
			mysqli_free_result($res2);
			echo ("$playstr</TD></TR>\n"); 
    } 
?>
<script language="javascript">
function selecting(selType)
{
for (i=0;i<document.forms[0].elements.length;i++)
	{
	if ((document.forms[0].elements[i].type=='checkbox') & (document.forms[0].elements[i].name.substr(0,4)=="exp_"))
		{
		if (selType==1) {document.forms[0].elements[i].checked=true}
		if (selType==2) {document.forms[0].elements[i].checked=false}
		if (selType==3) {if (document.forms[0].elements[i].checked) {document.forms[0].elements[i].checked=false} else {document.forms[0].elements[i].checked=true}}
		}
	}
}
</script>
</TABLE>
</div>
<div class="w3-third w3-container">
<table class="w3-table w3-border">
<thead><tr class="w3-light-blue"><th colspan=2>Downloads</th></tr>
<tr><TD colspan=2>Password: <input type=password name="pwd" size=10 value="mlweb"></TD><tr>
<tr class="w3-light-grey w3-border"><TD><input type=button value="download selected" onClick="download()"></td><td><input type=checkbox name=unpack value=true checked>Unpack events</TD></tr>
<tr><td>Threshold (ms):</td><td><input type=text name=threshold value='200'></td></tr>
<tr><td>divisions (1=all, 2=halfs ect.):</td><td><input type=text name=divisions value='1'></td></tr>
<tr><td colspan=2><input type=button value="download and process selected" onClick="process()"></td></tr>
</Table>
</div>
</div>
</form>
</div>
<footer class="w3-container w3-blue">
		<h4>(C) Martijn Willemsen</h4>
        </footer>
</BODY>
</HTML>
<?php } // end if
?> 
