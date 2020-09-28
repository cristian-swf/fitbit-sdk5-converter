#!/usr/bin/env node

const yargs = require("yargs");
const fs 	= require("fs");
const path 	= require("path");
const { execSync } = require("child_process");

console.log('fitbit-sdk5-converter - Welcome');

const options = yargs
 .usage("Usage: -p <projectfolder>")
 .option("p", { alias: "projectfolder", describe: "Current project you wish to convert", type: "string", demandOption: true })
 .option("b", { alias: "nobackup", default: false, describe: "Do not create a backup of the current project", type: "boolean", demandOption: false })
 .option("k", { alias: "removekpay", default: false, describe: "Remove kpay files so you can update them easily", type: "boolean", demandOption: false })
 .option("d", { alias: "debug", default: false, describe: "Debug mode", type: "boolean", demandOption: false })
 .argv;
 
console.log("Converting project " + options.p); 

var newProjectDir = options.p + "sdk5";
var backupDir = "backups/" + options.p; // + "_backup";

if(options.d)
{
	console.log("Debug mode is ON, deleting folders...");
	
	options.b = true;
	
	if(fs.existsSync(newProjectDir))
	{
		fs.rmdirSync(newProjectDir, { recursive: true }, (err) => 
		{
			if (err) 
			{
				console.error(err);
			}
		});
	}
}

if(!fs.existsSync(options.p))
{
	console.log("ERROR: project folder " + options.p + " does not exists!");
}
else
{
	if(options.b)
	{
		console.log("Skipping project backup...");
	}
	else
	{
		if(!fs.existsSync(backupDir))
		{
			if(!fs.existsSync('backups'))
				fs.mkdirSync('backups');
				
			copyRecursiveSync(options.p, backupDir);
			console.log("Backup created!");
		}
		else
		{
			console.log("Backup NOT created, folder already exists!");
		}
	}
	
	if(!fs.existsSync(newProjectDir))
	{
		copyRecursiveSync(options.p, newProjectDir);
		console.log("SDK5-specific project folder created!");
	}
	else
	{
		console.log("SDK5-specific project folder already exists, stopping program!");
		return ;
	}
	
	//1. modify package.json
	var sdk5packagejson = newProjectDir + "/package.json";
	
	var fileContent = fs.readFileSync(sdk5packagejson);
	fileContent = JSON.parse(fileContent);

	//replace sdk versions in project.json
	fileContent.devDependencies['@fitbit/sdk'] = '~5.0.1';
	fileContent.devDependencies['@fitbit/sdk-cli'] = '^1.7.3';
	
	//replace targets in project.json
	fileContent.fitbit.buildTargets = ['atlas', 'vulcan'];
	
	//bump version
	var currentVersion = fileContent.version;
	
	console.log("Current version: " + currentVersion);
	
	currentVersion = currentVersion.split('.');

	var newVersion = '';
	for(var i=0; i<currentVersion.length - 1; i++)
		newVersion+=currentVersion[i] + '.';
	
	newVersion+= parseInt(currentVersion[currentVersion.length-1]) + 1;
	
	console.log("New version: " + newVersion);
	
	fileContent.version = newVersion;

	fs.writeFileSync(sdk5packagejson, JSON.stringify(fileContent, null, "\t"), function writeJSON(err) 
	{
	  if (err) 
		  return console.log(err);
	});
	
	
	//2. rename files in resources folder
	fs.renameSync(newProjectDir + '/resources/index.gui', newProjectDir + '/resources/index.view', 
	function(err) 
	{
		if ( err ) 
			console.log('ERROR: ' + err);
	});
	
	fs.renameSync(newProjectDir + '/resources/widgets.gui', newProjectDir + '/resources/widget.defs', 
	function(err) 
	{
		if ( err ) 
			console.log('ERROR: ' + err);
	});
	
	//check if the project has fitfont and rename it
	if(fs.existsSync(newProjectDir + '/resources/fitfont.gui'))
	{
		fs.renameSync(newProjectDir + '/resources/fitfont.gui', newProjectDir + '/resources/fitfont.view', 
		function(err) 
		{
			if ( err ) 
				console.log('ERROR: ' + err);
		});
	}
	
	//3. adjust widget.defs
	var sdk5widgetdefs = newProjectDir + "/resources/widget.defs";
	
	var fileContent = fs.readFileSync(sdk5widgetdefs, 'utf8');
	
	fileContent = fileContent.replace("kpay.gui", "kpay.view");
	fileContent = fileContent.replace("fitfont.gui", "fitfont.view");
	fileContent = fileContent.replace("/mnt/sysassets/widgets_common.gui", "/mnt/sysassets/system_widget.defs");
	fileContent = fileContent.replace("/mnt/sysassets/widgets/push_button_widget.gui", "/mnt/sysassets/widgets/text_button.defs");
	//TODO: add all the widgets that have been replaced!
	
	fs.writeFileSync(sdk5widgetdefs, fileContent, function writeFile(err) 
	{
	  if (err) 
		  return console.log(err);
	});
	
	//5. adjust index.view, replace width="300" with width="336" and height...
	var sdk5indexview = newProjectDir + "/resources/index.view";
	
	var fileContent = fs.readFileSync(sdk5indexview, 'utf8');
	
	fileContent = fileContent.replace(/x="150"/g, 'x="168"');
	fileContent = fileContent.replace(/width="300"/g, 'width="336"');
	fileContent = fileContent.replace(/height="300"/g, 'height="336"');
	//TODO: check if we need other adjustments!
	
	fs.writeFileSync(sdk5indexview, fileContent, function writeFile(err) 
	{
	  if (err) 
		  return console.log(err);
	});
	
	//6. remove kpay library files
	if(options.k)
	{
		console.log("Removing k-pay files...");
		
		fs.rmdirSync(newProjectDir + "/app/kpay/", { recursive: true }, function(err)
		{
		  if (err) 
			console.error(err);
		});
		
		fs.rmdirSync(newProjectDir + "/common/kpay/", { recursive: true }, function(err)
		{
		  if (err) 
			console.error(err);
		});
		
		fs.rmdirSync(newProjectDir + "/companion/kpay/", { recursive: true }, function(err)
		{
		  if (err) 
			console.error(err);
		});
		
		fs.rmdirSync(newProjectDir + "/resources/kpay/", { recursive: true }, function(err)
		{
		  if (err) 
			console.error(err);
		});
		
		console.log("k-pay files removed, don't forget to add the new k-pay files for SDK 5.0");
	}
	
	//7. call npm install maybe?
	console.log("Running npm install in the new directory...");
	
	if(!options.d)
	{
		execSync("cd " + newProjectDir + " & npm install", (error, stdout, stderr) => 
		{
			if (error) 
			{
				console.log(`error: ${error.message}`);
				return;
			}
			if (stderr) 
			{
				console.log(`stderr: ${stderr}`);
				return;
			}
			
			console.log(`${stdout}`);
		});
	}
	
	//8. copy extra resources files
	copyRecursiveSync(__dirname + '/../copyfiles/resources/', newProjectDir + '/resources/');
	
	if(options.k)
	{
		copyRecursiveSync(__dirname + '/../copyfiles/kpay/', newProjectDir);
	}
	
	//9. check for images that are 300x300 and resize them to 336 x 336
	//https://github.com/image-size/image-size#readme
	
	var Jimp 	= require("jimp");
	var sizeOf 	= require('image-size');
	
    const inputFolder = newProjectDir + '/resources/';
	
    fs.readdir(inputFolder, function (err, files)
	{
      files.forEach(file => 
	  {
        if( file.toLowerCase().endsWith(".jpg") || file.toLowerCase().endsWith(".png")) 
		{
			if(sizeOf(inputFolder + file).width==300 && sizeOf(inputFolder + file).height==300)
			{
				console.log('Resizing ' + file + ' to 336x336...');
				resizeImage(inputFolder + file);
			}
        }
      });
    });
	
	//4. delete all Ionic rss file
	console.log('Deleting Ionic rss files...');
	deleteFilesUsingPattern(/~348x250+/, newProjectDir + '/resources/');
    
}

//functions
function copyRecursiveSync(src, dest)
{
  var pattern = /node_modules/g;
  
  //console.log(src);
  
  if(!pattern.test(src))
  {
	var exists = fs.existsSync(src);
	var stats = exists && fs.statSync(src);
	var isDirectory = exists && stats.isDirectory();
	
	if (isDirectory) 
	{
		if(!fs.existsSync(dest))
			fs.mkdirSync(dest);
	
		fs.readdirSync(src).forEach(function(childItemName) 
		{
			copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
		});
	}	
	else 
	{
		fs.copyFileSync(src, dest);
	}
  }
  else
	  console.log('Skipping copy of ' + src + '...');
}

function deleteFilesUsingPattern(pattern, directory)
{
	directory = path.resolve(directory);
	
	fs.readdir(directory, function(err, files) 
	{
		if (err) throw err;

		for(const name of files) 
		{
			if (pattern.test(name)) 
			{
				console.log(`Deleted ${name}`);
				fs.unlinkSync(directory + "/" + name, function (err)
				{
				  if (err) throw err;
				  console.log(`Error deleting ${name}`);
				});
			}
		}
	});
}

function resizeImage(fileName) 
{
      Jimp.read(fileName).then(function (image) 
	  {
        image
            .resize(336, 336)
            .quality(85)
            .write(fileName);
      })
	  .catch(function (e) 
	  {
        console.log(e, fileName)
      });
}