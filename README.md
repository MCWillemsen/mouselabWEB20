# mouselabWEB20
Development version of MouselabWEB 2.0

This github contains a beta version of mouselabWEB 2.0. What are the important new features?
- based on jQuery and w3.css (easy and responsive layout)
- uses a json definition file for the mouselab table
- works with a touch screen 
- can use blurring on boxes rather than a box covering the information
- new mysqli code compatible with newer php versions in the php scripts
- new very flexible layout with cells containing subcells
- beta version of an editor 

many todo's such as:
- update datalyser and playback to new style and new approach
- better tools for running multiple pages

------------------
# Demo
Go the the following link to test a demo version (enter your own identifier in the "subject=" part)

https://mlweb2.mouselabweb.org/demo/tv.php?subject=test&condnum=0
Use condnum to see different versions of the orders or use condnum=-1 to determine this randomly

The demo covers 4 pages:
- page 1: tv example with a lot of w3.css based formatting, looking like an actual web shop. using Blur and using a new feature that has cells within cells (for example, 5 reviews in one cell).
- page 2: survey page with example of typical survey style questions  (radio, open, checkbox, scale)using w3.css formatting and jquery type of validation. 
- page 3 and 4: two gambles with options that have several outcomes and probabilities, again using subcells to hold an probability outcome pair. Two versions using two different sets defined in the same json file, that have a transposed order (using attributeCol or optionCol formatting). So both gamble pages use the same json-definition file! The file also has many delays between some comparisons.

Check for the data:

https://mlweb2.mouselabweb.org/demo/datalyser.php

----------------
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
Start with flextest.php or any other of the files as shown in the demo
if you add subject and condnum, you have more control over presentation order
(e.g. gamble.php?subject=martijn&condnum=2)

The demo files show the possibilities of using the JSON description files

------------------
# how does it work
check the document with the JSON properties, and pick an existing JSON file to edit it. The JSON editor currently being developed (mouselabEditor.html) can help with this. Note that if the json code breaks, you can use an online JSON validator to see where the errors are. 
Take an existing php page (like gamble.php) and edit that for your own purposes. You only need to edit nextURL, expname and the json file that is loaded in the comment generateTrial to create a new page. 
The basic idea is that a study is a set of pages that link to eachother via the nextURL. See the original MouselabWEB documentation for the basic idea.

------------------
# Differences compared to earlier versions and original MouselabWEB 
- Uses post in stead of get variables to pass subject and condnum to the next page. Get variables override post variables though. If you start a page with get variables, it wil transfer them to post an get rid of the get variables in the header of the next page.
- some small changes in default settings of saving data (CSV) and mlwebform name now included in the javascript so no need anymore for setting these in every page
- checkForm script can still be used but the preferred way is to use the jQuery required feature to set form elements to be required. 
- delay matrix does not have to be defined between all cells, just define it for the cells you want delays with (see tv.php example)
