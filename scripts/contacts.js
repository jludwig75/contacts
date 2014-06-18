
function EditableField(parent, title, name, value)
{
	this.id = parent.domId + '_' + name;
	this.parent = parent;
	this.title = title;
	this.name = name;
	this.value = value;
	this.staticId = this.id + '_static';
	this.editId = this.id + '_edit';
	this.editableId = this.id + '_field';
	this.okId = this.id + '_ok';
	this.cancelId = this.id + '_cancel';
	this.inputId = this.id + '_input';
	if (this.value == '')
	{
		this.value = 'Click to add';
	}
	this.render = function()
	{
		return this.renderStatic() + this.renderEdit(); 
	};
	this.renderStatic = function()
	{
		return 	'<span id="' + this.staticId + '" class="field_static ' + this.name + '_static">' +
				'	<b>' + this.title + '</b>: ' +
				'	<span id="' + this.editableId + '" class="editable_field">' + this.value + '</span>' +
				'</span>';
	};
	this.renderEdit = function()
	{
		return	'<span id="' + this.editId + '" class="field_edit ' + this.name + '_edit">' +
				'	<b>' + this.title + '</b>: '+
				'	<input id="' + this.inputId + '" type="text" name="' + this.name + '" value="' + this.value + '">' +
				'	<button id="' + this.okId + '" class="ok_button" type="button"">OK</button>' +
				'	<button id="' + this.cancelId + '" class="cancel_button" type="button"">Cancel</button>' +
				'</span>';
	};
	this.hideStaticField = function()
	{
		$('#' + this.staticId).hide();
	};
	this.showStaticField = function()
	{
		$('#' + this.staticId).show();
	};
	this.hideEditField = function()
	{
		$('#' + this.editId).hide();
	};
	this.showEditField = function()
	{
		$('#' + this.editId).show();
	};
	this.onClickStatic = function()
	{
		this.hideStaticField();
		this.showEditField();
		var input = $('#' + this.inputId);
		if (this.value == 'Click to add')
		{
			input.val('');
		}
		input.focus();
		input[0].selectionStart = 0;
		input[0].selectionEnd =  this.value.length;
	};
	this.onClickCancel = function()
	{
		this.hideEditField();
		this.showStaticField();
		$('#' + this.inputId).val(this.value);
	};
	this.onClickOk = function()
	{
		var value = $('#' + this.inputId).val();
		if (value == 'Click to add')
		{
			value = '';
		}
		this.parent.update(this.name, value);
	};
	this.setEnterToOk = function ()
	{
		var that = this;
		$('#' + this.inputId).keyup(function(e){
	    	if(e.keyCode == 13)
	    	{
	    		that.onClickOk();
	    	}
	    	else if(e.keyCode == 27)
	    	{
	    		that.onClickCancel();
	    	}
		});
	};
	this.enableEvents = function()
	{
		var that = this;
		$('#' + this.editableId).click(function(){that.onClickStatic();});
		$('#' + this.okId).click(function(){that.onClickOk();});
		$('#' + this.cancelId).click(function(){that.onClickCancel();});
		this.setEnterToOk();
	};
}

function ContactEntry(contact)
{
	this.contact = contact;
	this.fields = [];
	this.domId = "contact_" + contact.id;;

	this.addField = function(field)
	{
		this.fields[this.fields.length] = field;
	};
	
	this.enableEvents = function()
	{
		$('#' + this.domId + ' .contact_heading').click(function(){
			$(this).next().slideToggle();
		});
		
		for(var i = 0; i < this.fields.length; i++)
		{
			this.fields[i].enableEvents();
		}		
	};
	
	this.renderContents = function()
	{
		var html =  '	<div class="contact_heading">' +
					'		' + this.contact.lastName + ', ' + this.contact.firstName + 
					'	</div>' +
					'	<div class="contact_details">' +
					'   <div class="contact_message"></div>' +
					'		<ul>';
			
			for(var i = 0; i < this.fields.length; i++)
			{
				html = html + '<li>';
				html = html + this.fields[i].render();
				html = html + '</li>';
			}
				
			html = html +   '		</ul>' +
							'	</div>';
		
		return html;
	};

	this.render = function()
	{
		var html =  '<div id="' + this.domId + '" class="contact">' + this.renderContents() + '</div>';
		
		return html;
	};
	
	this.update = function(fieldName, fieldValue)
	{
		switch(fieldName)
		{
			case 'lastName':
				this.contact.lastName = fieldValue;
				break;
			case 'firstName':
				this.contact.firstName = fieldValue;
				break;
			case 'personalEmail':
				this.contact.personalEmail = fieldValue;
				break;
			case 'workEmail':
				this.contact.workEmail = fieldValue;
				break;
		}
		if (!this.contact.update())
		{
			$('#' + this.domId + ' .contact_message').html('Failed to update contact ' + fieldName + '! Check conneciton and login.');
		}
		else
		{
			this.buildFields();
			$('#' + this.domId).html(this.renderContents());
			this.enableEvents();
			$('#' + this.domId + ' .contact_details').show();
		}
	};
	
	this.buildFields = function()
	{
		this.fields = [];
		this.addField(new EditableField(this, "Last Name", "lastName", contact.lastName));
		this.addField(new EditableField(this, "First Name", "firstName", contact.firstName));
		this.addField(new EditableField(this, "Personal E-mail", "personalEmail", contact.personalEmail));
		this.addField(new EditableField(this, "Work E-mail", "workEmail", contact.workEmail));
	};

	this.buildFields();
}

function ContactList(contacts)
{
	this.contactEntries = [];
	this.addContactEntry = function(contact)
	{
		this.contactEntries[this.contactEntries.length] = new ContactEntry(contact);
	};

	for(var i = 0; i < contacts.length; i++)
	{
		this.addContactEntry(contacts[i]);
	}
	
	this.enableEvents = function()
	{
		for(var i = 0; i < this.contactEntries.length; i++)
		{
			this.contactEntries[i].enableEvents();
		}
	};
	
	this.display = function()
	{
		var html = '';
		for(var i = 0; i < this.contactEntries.length; i++)
		{
			html = html + this.contactEntries[i].render();
		}
		$("#contact_list").html(html);
		
		this.enableEvents();
	};
}

// Create			
function addContact(contact)
{
	var success;
	var text = 'contact=' + JSON.stringify(contact);
	$.ajax({
        type: "POST",
        url: '/contact',
        async: false,
        data: text,
        success: function(d) {
        	success = true;
        },
        error: function(xhr, status, error) {
        	success = false;
        }
    });
	return success;
}

// Retrieve
function getContacts()
{
	var contacts;
	$.ajax({
        type: "GET",
        url: '/contact',
        async: false,
        success : function(d) {
            contacts = $.parseJSON(d);
        }
    });
    for(var i = 0; i < contacts.length; i++)
    {
    	contacts[i].update = updateContact;
    	contacts[i].remove = deleteContact;
    }
	return contacts;
}

// Update
function updateContact()
{
	var success;
	var text = 'id=' + this.id + '&contact=' + JSON.stringify(this);
	$.ajax({
        type: "PUT",
        url: '/contact',
        async: false,
        data: text,
        success: function(d) {
        	success = true;
        },
        error: function(xhr, status, error) {
        	success = false;
        }
    });
	return success;
}

// Delete
function deleteContact()
{
	var success;
	var text = 'id=' + this.id;
	$.ajax({
        type: "DELETE",
        url: '/contact',
        async: false,
        data: text,
        success: function(d) {
        	success = true;
        },
        error: function(xhr, status, error) {
        	success = false;
        }
    });
	return success;
}

var contactList;

function displayContacts()
{
	contactList = new ContactList(getContacts());
	
	contactList.display();
}

function hideNewContactForm()
{
	$("#add_contact_div").hide();
	$("#add_contact").show();
}

function showNewContactForm()
{
	$("#add_contact").hide();
	$("#add_contact_div").show();
}

function clearNewContactForm()
{
	$("input[name=lastName]").val("");
	$("input[name=firstName]").val("");
	$("input[name=personalEmail]").val("");
	$("input[name=workEmail]").val("");
}

function contactFromForm()
{
	return {
				lastName: $("input[name=lastName]").val(),
				firstName: $("input[name=firstName]").val(),
				personalEmail: $("input[name=personalEmail]").val(),
				workEmail: $("input[name=workEmail]").val(),
			};
}

$(document).ready(function()
{
	displayContacts();
		
	$("#add_contact").click(function(){
		showNewContactForm();
	});
	
	$("#cancel_new_contact").click(function(){
		hideNewContactForm();
		return false;
	});
	
	$("#add_new_contact").click(function(){
		var contact = contactFromForm();
		if (addContact(contact))
		{
        	displayContacts();
			hideNewContactForm();
			clearNewContactForm();
		}
		return false;
	});
});


