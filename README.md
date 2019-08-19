# mouselabWEB20
Development version of MouselabWEB 2.0

This github contains a beta version of mouselabWEB 2.0. What are the important new features?
- based on jQuery and w3.css (easy and responsive layout)
- uses a json definition file for the mouselab table
- works with a touch screen 
- using blurring on boxes rather than a box covering the information
- new mysqli code compatible with newer php versions in the php scripts
- new editor to edit the JSON files
------------------
# Demo
Go the the following link to test a demo version (enter your own identifier in the "subject=" part)
https://mlweb2.mouselabweb.org/demo/tv.php?subject=test&condnum=0
Use condnum to see different versions of the orders or use condnum=-1 to determine this randomly

Check for the data:
https://mlweb2.mouselabweb.org/demo/datalyser.php 
------------------
# Editor

MouselabWEB comes with a new editor (beta) that allows you to edit the JSON structure by point and click, 
or load files ad adjust them. The files allow for creating and adjusting the boxes. 
https://mlweb2.mouselabweb.org/demo/mouselabEditor.html
bug: While loading the page the json does not always gets loaded, refresh (F5) if you don;t see add buttons

------------------
# Installation
- Download all files
- Edit the mlwebdb.inc.php with your database connection  
- Upload all files to a webserver
- run createtable.php to create the table into the database

-----------------
# test
Start with tv.php 
if you add subject and condnum, you have more control over presentation order
(e.g. tv.php?subject=martijn&condnum=2)

The demo files show the possibilities of using the JSON description files

