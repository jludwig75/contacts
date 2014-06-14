import os
import random
import string
import json
import cherrypy
from cherrypy.lib.static import serve_file
from model.user import *

cherrypy.config.update({'session_filter.on': True})

from mako.template import Template
from mako.lookup import TemplateLookup
lookup = TemplateLookup(directories=['html'])

class SessionData:
    def __init__(self):
        cherrypy.log('Creating new session data')
        self.user = None
    
    def SetUserId(self, user_id):
        self.ClearUserId()
        cherrypy.session['user_id'] = user_id
        
    def GetUser(self):
        if self.user:
            return self.user;
        if not cherrypy.session.get('user_id'):
            return None
        self.user = User(cherrypy.session.get('user_id'))
        return self.user
    
    def ClearUser(self):
        cherrypy.session.pop('user_id')
        self.user = None
    

session_data = {}

def GetSessionData():
    session_id = cherrypy.session.id
    cherrypy.log('Retrieving session data for session %s' % session_id)
    if not session_data.has_key(session_id):
        session_data[session_id] = SessionData()
    return session_data[session_id]

def ClearSessionData():
    session_id = cherrypy.session.id
    cherrypy.log('Clearing session data for session %s' % session_id)
    if session_data.has_key(session_id):
        del session_data[session_id]

def GetUser():
    session = GetSessionData()
    if not session:
        return None
    return session.GetUser()

class ContactController(object):
    
    
    def index(self):
        if not GetUser():
            raise cherrypy.HTTPRedirect("/login")
        
        tmpl = lookup.get_template("index.html")
        return tmpl.render()
    index.exposed = True
    
    def login(self):
        if GetUser():
            raise cherrypy.HTTPRedirect("/")
        tmpl = lookup.get_template("login.html")
        return tmpl.render()
    login.exposed = True
    
    def signup(self, username, password, email):
        try:
            user = User.create(username, password, email)
            return "OK"
        except UserException, e:
            return e.message
    signup.exposed = True

    def authenticate(self, username, password):
        try:
            user = User(username)
            if user.authenticate(password):
                cherrypy.session['user_id'] = user.user_id
                return "OK"
        except UserException, e:
            pass
        return "Unknown user name or password"
    authenticate.exposed = True
    
    def logout(self):
        GetSessionData().ClearUser()
        ClearSessionData()
        raise cherrypy.HTTPRedirect("/")
    logout.exposed = True

conf = os.path.join(os.path.dirname(__file__), 'contacts.conf')


contacts = [{'id': 1, 'lastName': "Ludwig", 'firstName': "Jonathan", 'personalEmail': "jr.ludwig@gmail.com", 'workEmail': "jludwig@fusionio.com"},
            {'id': 2, 'lastName': "Ludwig", 'firstName': "Deneen", 'personalEmail': "deneenl@gmail.com", 'workEmail': ""}]

nextContactId = 3

def FindContact(id):
    for contact in contacts:
        if contact['id'] == id:
            return contact 
    return None
    
class StringGeneratorWebService(object):
    exposed = True

    @cherrypy.tools.accept(media='text/plain')
    def GET(self, id=None):
        if not GetUser():
            raise cherrypy.HTTPRedirect("/login")
        if id == None:
            return json.dumps(contacts)
        id = int(id)
        contact = FindContact(id)
        if not contact:
            raise cherrypy.HTTPError(404, 'Contact ID not found')
        return json.dumps(contact)

    def POST(self, contact):
        global nextContactId
        if not GetUser():
            raise cherrypy.HTTPRedirect("/login")
        contact = json.loads(contact)
        contact['id'] = nextContactId
        nextContactId += 1
        contacts.append(contact)
        return json.dumps(contact)

    def PUT(self, id, contact):
        if not GetUser():
            raise cherrypy.HTTPRedirect("/login")
        id = int(id)
        newContact = json.loads(contact)
        contact = FindContact(id)
        if not contact:
            raise cherrypy.HTTPError(404, 'Contact ID not found')
        for k, v in newContact.iteritems():
            if k != 'id':
                contact[k] = v
        return json.dumps(contact)

    def DELETE(self, id=None):
        if not GetUser():
            raise cherrypy.HTTPRedirect("/login")
        id = int(id)
        contact = FindContact(id)
        if not contact:
            raise cherrypy.HTTPError(404, 'Contact ID not found')
        contacts.remove(contact)

restConf = {
         '/': {
             'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
             'tools.sessions.on': True,
             'tools.response_headers.on': True,
             'tools.response_headers.headers': [('Content-Type', 'application/x-www-form-urlencoded')],
             'tools.sessions.on': True,
             'tools.sessions.storage_type': "file",
             'tools.sessions.storage_path': "/dev/contacts/sessions",
             'tools.sessions.timeout': 60,
         },
         'global': {
             'server.ssl_module': 'builtin',
             'server.ssl_certificate': "cert.pem",
             'server.ssl_private_key': "privkey.pem",
         }
     }

if __name__ == '__main__':
    # CherryPy always starts with app.root when trying to map request URIs
    # to objects, so we need to mount a request handler root. A request
    # to '/' will be mapped to HelloWorld().index().
    cherrypy.tree.mount(ContactController(), config=conf)
    cherrypy.quickstart(StringGeneratorWebService(), '/contact', config=restConf)
    
    cherrypy.engine.start()
    cherrypy.engine.block()
else:
    # This branch is for the test suite; you can ignore it.
    cherrypy.tree.mount(ContactController(), config=conf)