# mouselabWEB20
Development version of MouselabWEB 2.0

This github contains a beta version of mouselabWEB 2.0. What are the important new features?
- based on jQuery and w3.css (easy and responsive layout)
- uses a json definition file for the mouselab table
- works with a touch screen 
- using blurring on boxes rather than a box covering the information
- new mysqli code compatible with newer php versions in the php scripts
- this version: new flexible layout
------------------
# Demo (old version, not updated yet)
Go the the following link to test a demo version (enter your own identifier in the "subject=" part)
http://www.mouselabweb.org/mouselabWEB20-withDelays/tv.php?subject=test&condnum=0
Use condnum to see different versions of the orders or use condnum=-1 to determine this randomly

Check for the data:
http://www.mouselabweb.org/mouselabWEB20-withDelays/datalyser.php 

------------------
# Installation
- Download all files
- Edit the mlwebdb.inc.php with your database connection  
- Upload all files to a webserver
- run createtable.php to create the table into the database

-----------------
# test
Start with gamble.php 
if you add subject and condnum, you have more control over presentation order
(e.g. gamble.php?subject=martijn&condnum=2)

The demo files show the possibilities of using the JSON description files

