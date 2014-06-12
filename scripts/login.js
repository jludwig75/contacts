function signUp()
{
	if(window.XMLHttpRequest)
  	{// code for IE7+, Firefox, Chrome, Opera, Safari
  		xmlhttp=new XMLHttpRequest();
  	}
	else
  	{// code for IE6, IE5
  		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  	}
  	
  	xmlhttp.onreadystatechange=function()
  	{
  		if (xmlhttp.readyState==4)
    	{
    		if (xmlhttp.status==200)
    		{
	    		if ("OK" == xmlhttp.responseText)
	    		{
	    			window.location.assign("/");
	    		}
	    		else
	    		{
		    		msgDiv = document.getElementById("signup-messages");
		    		msgDiv.style.display = 'block';
	    			msgDiv.innerHTML = "<p style=\"color:red\">Error creating user: " + xmlhttp.responseText + "</p>";
	    		}
    		}
    		else
    		{
    			msgDiv.innerHTML = "<p style=\"color:red\">HTTP error creating user. Try again.</p>";
    		}
    	}
  	};
  	
  	username = document.getElementById("new-username").value;
  	password = document.getElementById("new-password").value;
  	passwordVerify = document.getElementById("new-password-verify").value;
  	email = document.getElementById("email").value;
  	
	xmlhttp.open("POST", "signup", true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send("username=" + username + "&password=" + password + "&email=" + email);
}

function authenticate()
{
	if(window.XMLHttpRequest)
  	{// code for IE7+, Firefox, Chrome, Opera, Safari
  		xmlhttp=new XMLHttpRequest();
  	}
	else
  	{// code for IE6, IE5
  		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  	}
  	
  	xmlhttp.onreadystatechange=function()
  	{
  		if (xmlhttp.readyState==4)
    	{
    		if (xmlhttp.status==200)
    		{
	    		if ("OK" == xmlhttp.responseText)
	    		{
	    			window.location.assign("/");
	    		}
	    		else
	    		{
		    		msgDiv = document.getElementById("login-messages");
		    		msgDiv.style.display = 'block';
	    			msgDiv.innerHTML = "<p style=\"color:red\">Login error: " + xmlhttp.responseText + "</p>";
	    		}
    		}
    		else
    		{
    			msgDiv.innerHTML = "<p style=\"color:red\">HTTP error. Try again.</p>";
    		}
    	}
  	};
  	
  	username = document.getElementById("username").value;
  	password = document.getElementById("password").value;
  	
	xmlhttp.open("POST", "authenticate", true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send("username=" + username + "&password=" + password);
}

function logout()
{
	if(window.XMLHttpRequest)
  	{// code for IE7+, Firefox, Chrome, Opera, Safari
  		xmlhttp=new XMLHttpRequest();
  	}
	else
  	{// code for IE6, IE5
  		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  	}
  	
  	xmlhttp.onreadystatechange=function()
  	{
  		if (xmlhttp.readyState==4)
    	{
    		if (xmlhttp.status==200)
    		{
    			window.location.assign("/");
    		}
    		else
    		{
    			//msgDiv.innerHTML = "<p style=\"color:red\">HTTP error. Try again.</p>";
    		}
    	}
  	};
  	
	xmlhttp.open("POST", "logout", true);
	xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	xmlhttp.send();
}
