<?php 
// 		create_table.php create a mouselabWEB table 
//
//       v 2.00, Nov 2017
//
//     (c) 2003-2017 Martijn C. Willemsen and Eric J. Johnson 
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

include('mlwebdb.inc.php');
$sqlquery = "CREATE TABLE IF NOT EXISTS $table (id INTEGER PRIMARY KEY, expname VARCHAR(50), subject VARCHAR(50), ip varchar(20), condnum INTEGER, choice VARCHAR(50), submitted DATETIME, procdata TEXT, addvar TEXT, adddata TEXT)";
$result=mysqli_query($link,$sqlquery) or die("Invalid Query : ".mysqli_error($link)); 
echo('Table created');
mysqli_close($link);
?>
