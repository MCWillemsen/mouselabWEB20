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
					if ($evtarr[0]==$openevt[$opentype]) {$procvars=array_merge($procvars,array($evtarr[1]=>0));}					
					}
				}
			elseif (strpos($procdata,"\"")!==false)
				{
				$eventstr = explode("\n",rtrim($procdata));
				unset($evtarr,$addrow);
				for ($evt=1;$evt<count($eventstr);$evt++)
					{
					$evtarr=explode("\",\"", substr(trim($eventstr[$evt]),1,strlen(trim($eventstr[$evt]))-2));
					$addrow[$evt-1]=array_merge(array_slice($rowarr[$j],0,$prockey),$evtarr,array_slice($rowarr[$j],$prockey+1));
					//echo $evt."|".implode("|",$addrow[$evt])."\n";
					if ($evtarr[0]=='events') {$opentype=substr($evtarr[2],0,1);}
					if ($evtarr[0]==$openevt[$opentype]) {$procvars[$evtarr[1]]=0;}			
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
				for ($evt=1;$evt<count($eventstr);$evt++)
					{
					$evtarr[$evt-1]=explode("\",\"", substr(trim($eventstr[$evt]),1,strlen(trim($eventstr[$evt]))-2));
					}
				}
return $evtarr;
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
    while (list($key, $value) = each($row)) 
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
		while (list($key, $value) = each($row)) 
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
<TITLE>
MouselabWEB Datalyser
</TITLE>
<link rel="stylesheet" href="mlweb.css" type="text/css">
</head>
<body>
<H1>Links to CSV files for selected experiments</H1>
<Table>
<?php 
for ($expcount=0;$expcount<count($arr);$expcount++)
{
$filename = 'tmp/'.$arr[$expcount].".csv";
echo ("<TR><TD>$arr[$expcount]</TD><TD><a href=\"$filename\">$filename</a></TD></TR>");
}
?>

</body>
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
			$outrow=array();
			$freqvar = array();
			$timevar = array();
			$outrow_s = array();
			$glprocvars=array(); // this array is used to save names of the boxes to count the process vars...
			$gladdvars=array(); 
			$rowarr = ExpfromDB($arr[$expcount],$table);
			for ($j=0;$j<count($rowarr);$j++)
				{ 
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
							$outrow[0]=array_merge(array_slice($temprow2[0],0,$timeKey-2),array("roword" => "roword", "colord" => "colord","evttype" => "evttype","boxname" => "boxname","boxin" => "boxin","boxtime" => "boxtime","counter" => "counter"), array_slice($temprow2[0],$timeKey+1));
							
							}
							$localcount=0;
							$outrowtmp = array();
							for ($c=1;$c<count($temprow2);$c++)
									{
									if ($temprow2[$c][$eventKey]==$closeevt[$closetype])
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
													}
												}
												else
												{
												$boxendtime=$temprow2[$c][$eventKey+3]-$starttime;
												$boxtime=$boxendtime-$glprocvars[$boxname];
												if ($boxtime>$th) 
													{																			
													$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], $boxtime));
													}
												$glprocvars[$boxname]=0;
												$glproccount[$boxname]=0;
												}
											}
									else if ($temprow2[$c][$eventKey]==$openevt[$opentype])
									// an open event!
											{
											$boxname=$temprow2[$c][$eventKey+1];
						
											if ($glprocvars[$boxname]==0) 
													{$glprocvars[$boxname]=$temprow2[$c][$eventKey+3]-$starttime;
													$localcount++;
													$glproccount[$boxname]=$localcount;
													}
													else 
													{
													// there was already a time so close this event
													$boxendtime=$temprow2[$c][$eventKey+3]-$starttime;
													$boxtime=$boxendtime-$glprocvars[$boxname];
													$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], $boxtime));
												$glprocvars[$boxname]=0;
												$glproccount[$boxname]=0;
													}
											if ($closetype==3) 
														{																			
														// no close event, write events with no time directly
														$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], 0));
												$glprocvars[$boxname]=0;
												$glproccount[$boxname]=0;
														}
											}
									else if ($temprow2[$c][$eventKey]=="mouseover" & $openevt[$opentype]!="mouseover")
											{
											//this must be an mouseover on another form element
											// set an open time for this element
											$boxname=$temprow2[$c][$eventKey+1];
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
											if ($glprocvars[$boxname]==0) 
											// generate a click event without time if there was no time registered
													{$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], 0));
												$glprocvars[$boxname]=0;
												$glproccount[$boxname]=0;
													}
													else 
													{
													// there was already a time so close this event
													// for example, this registers the total time needed for clicking on a button after a mouseover event occurred (measure for deliberation time?)
													$boxendtime=$temprow2[$c][$eventKey+3]-$starttime;
													$boxtime=$boxendtime-$glprocvars[$boxname];
													$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], $boxtime));
												$glprocvars[$boxname]=0;
												$glproccount[$boxname]=0;
													}
											}
										else if ($temprow2[$c][$eventKey]=="mouseout" & $closeevt[$closetype]!="mouseover")
											{
											//this must be an click on another form element
											$boxname=$temprow2[$c][$eventKey+1];
											if ($glprocvars[$boxname]>0) 
													{
													// there was already a time so close this event
													// for example, this registers the total time needed for clicking on a button after a mouseover event occurred (measure for deliberation time?)
													$boxendtime=$temprow2[$c][$eventKey+3]-$starttime;
													$boxtime=$boxendtime-$glprocvars[$boxname];
													$outrowtmp[$glproccount[$boxname]]=array_merge(array_slice($temprow2[$c],0,$timeKey-2), array($roword, $colord, $evttype, $boxname, $glprocvars[$boxname], $boxtime));
												$glprocvars[$boxname]=0;
												$glproccount[$boxname]=0;
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
											$outrowtmp[$glproccount[$key]]=array_merge(array_slice($temprow2[$c-1],0,$timeKey-2), array($roword, $colord, $evttype, $key, $glprocvars[$key], $boxtime));
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
<TITLE>
MouselabWEB Datalyser
</TITLE>
<link rel="stylesheet" href="mlweb.css" type="text/css">
</head>
<body>
<H1>Links to processed CSV files for selected experiments</H1>
<Table border=1>
<tr><tH>Experiment</tH><th>all events</th><th>summarized by division</th></tr>
<?php 
for ($expcount=0;$expcount<count($arr);$expcount++)
{
$filename1 = 'tmp/'.$arr[$expcount]."_proc.csv";
$filename2 = 'tmp/'.$arr[$expcount]."_proc_sum".$division.".csv";
echo ("<TR><TD>$arr[$expcount]</TD><TD><a href=\"$filename1\">$filename1</a></TD><TD><a href=\"$filename2\">$filename2</a></TD></TR>");
}
?>

</body>
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
											if ($outrow[$z][$i]=="") $outstr.="<TD class=\"tdstyle\">&nbsp;</TD>"; 
						 				else $outstr.="<TD class=\"tdstyle\">".htmlspecialchars($outrow[$z][$i])."</TD>";
											}	
										$outstr.="</TR>";
										}
									}									
									else 
									{
									
									$outrow= $temprow2[0];
									$outstr.="<TR>";
									for ($z=0;$z<count($outrow);$z++)
										{
										if ($outrow[$z]=="") $outstr.="<TD class=\"tdstyle\">&nbsp;</TD>"; 
						 				else $outstr.="<TD class=\"tdstyle\">".htmlspecialchars($outrow[$z])."</TD>";
										}	
										$outstr.="</TR>";
											
									}
						}
					else 
						{
						$outrow = $rowarr[$j];
						
							$outstr.="<TR>";
									for ($z=0;$z<count($outrow);$z++)
										{
										if ($outrow[$z]=="") $outstr.="<TD class=\"tdstyle\">&nbsp;</TD>"; 
						 				else $outstr.="<TD class=\"tdstyle\">".htmlspecialchars($outrow[$z])."</TD>";
										}	
										$outstr.="</TR>";
						}
				}
	?>
<HTML>
<HEAD>
<TITLE>
Download form for MouselabWEB data
</TITLE>
<link rel="stylesheet" href="mlweb.css" type="text/css">
<style type="text/css">
<!--
.tdstyle {font-size: 12px; 
background-color: #FFFFFF;
font-color: #000000;
}
-->
</style>
</head>
<body>
<H1>Results of Experiment <?php echo($expname);?></H1>
<Table border=1>
<?php echo($outstr); ?> 
</TABLE>

</body>
</HTML>
<?php
	} // end of show part
	if ($act=="play") 
		{// start of play part
		$expname = $_POST['expname'];
		
	$sqlQuery = "SELECT id, subject, submitted, procdata, condnum from $table where expname='$expname'";

    # Execute SQL query 
    $result=mysqli_query($link, $sqlQuery) or die("Invalid Query : ".mysqli_error($link)); 
    
    # Check whether NULL records found 
    if(!mysqli_num_rows($result)) 
        die("No records found.XX"); 
	$i=0;	
	// get subject data from database and unpack events
	while($rec=mysqli_fetch_row($result)) 
    	{ 	
		$rowarr[$i] = array($rec[0], $rec[1], $rec[2], $rec[4]);
		$procarr[$i] = unpackProc($rec[3]);
		if ($procarr[$i] !== FALSE) $i++; // only put subjects in the list with process data
		}
    ?>
<HTML>
<HEAD>
<TITLE>
MouselabWEB Datalyser 
</TITLE>
<link rel="stylesheet" href="mlweb.css" type="text/css">
<style type="text/css">
<!--
.tdstyle {font-size: 12px; 
background-color: #FFFFFF;
font-color: #000000;
}
-->
</style>
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
condnum = new Array();
numevents = new Array();

<?php
for ($i=0;$i<count($rowarr);$i++)
    { 	
	echo("id[".$i."]=".$rowarr[$i][0].";\nsubj[".$i."]=\"".$rowarr[$i][1]."\";\nsubm[".$i."]=\"".$rowarr[$i][2]."\";\ncondnum[".$i."]=".$rowarr[$i][3].";\n");
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
	playexp = "<?php echo($expname);?>.php";
	playcondnum = condnum[idnum];
	var newWind=window.open("playback.html","Playback","height="+(screen.availHeight-60).toString()+",width="+(screen.availWidth-30).toString() +",scrollbars,status,resizable, left=2, top=2");
	newWind.focus();
	}
}
</script>
</head>
<body>
<H1>Playback for experiment: <?php echo($expname);?></H1>
<form>
<table><TR><TD><P>Subject selection</P><select name="subj" onChange="showData(this.form)" class="tdstyle"><option value="">Select subject</option> 
<?php 
for ($i=0;$i<count($rowarr);$i++)
    { 	
	echo("<option value=\"$i\">".$rowarr[$i][0]."|".$rowarr[$i][1]."|".$rowarr[$i][2]."</option>");
	}
?>
</select></TD>
<TD><P>Process data of current subject</P><textarea name="proctxt" cols=80 rows=10 class="tdstyle"></textarea></TD></TR></table>
<input type="button" onClick="playData()" value="Playback Data">
<p><strong>Note:</strong>The Replay routine assumes that the php-file you want to replay has the same name as the experiment itself: <?php echo($expname);?>.php . You can change the name of the file on the replay page if it is different from the file name.</p>
</form>
</body>
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
<TITLE>
MouselabWEB Datalyser
</TITLE>
<link rel="stylesheet" href="mlweb.css" type="text/css">
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
<BODY>
<H1>MouselabWEB Datalyser</H1>
<P><strong>Part of MouselabWEB, version 1.00beta</strong></P>
<form method="post" action="datalyser.php">
<input type="hidden" name="act" value="">
<input type="hidden" name="expname" value="">
<P>
This screen enables you to download data in CSV (comma separated values) format. 
This is a textfile format in which each field is enclosed in brackets (") and separated by commas. Such a file can be read by most statistical programs. If the <strong>unpack events</strong> box is checked, the program will unpack the process data (whether it is in XML or CSV format in the database) into a list of events. 
</P>
<p>The <strong>download and process selected</strong> button allows to download processed data that can be analyzed directly. It will delete acquisitions below the threshold, will calculate time and frequency columns for each box on the screen, and will summarize data in divisions.</p>
<p><strong>Disclaimer: The processing module has not been checked extensively for the 1.00beta version! Check whether the output is consistent with the event files.</strong></p><p>
The <strong>Show Table</strong> button allows you to look at the data in one table, either unpacked or as is. The <strong>Playback</strong> allows for playback of participants in one of the experiments. This button wil open a new page in which you can select a participant from the list.</P>
<P>
<strong>Password:</strong> For any action you do on this page, a password is required. Type the password before pressing a button. This prevents unauthorized users that browse to this page from actually reading your data!
</P><Table border=1>
<TR><TH>Experiment name</TH><TH>Download</TH><TH>Show data</TH><TH>Play back</TH></TR>
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
<TR><TD>&nbsp;</TD><td><input type=button value="sel all" onClick="selecting(1);"> <input type=button value="Reset sel" onClick="selecting(2);"><br><input type=button value="Invert sel" onClick="selecting(3)"></td><TD>&nbsp;</TD><TD>&nbsp;</TD></TR>
<TR><TD rowspan=2>Password: <input type=password name="pwd" size=10 value="mlweb"></TD><TD colspan=3><input type=button value="download selected" onClick="download()"><br><input type=checkbox name=unpack value=true checked>Unpack events</TD></TR><tr><TD colspan=3><input type=button value="download and process selected" onClick="process()"><br/>Threshold (ms)<input type=text name=threshold value='200'><br/>divisions (1=all, 2=halfs ect.):<input type=text name=divisions value='1'></TD></TR>
</Table>
</form>

</BODY>
</HTML>
<?php } // end if
?> 