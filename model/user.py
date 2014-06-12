import MySQLdb
import hashlib
import uuid


def is_int(val):
    try:
        intVal = int(val)
        return True
    except:
        return False
    
def to_db_string(str):
    if str:
        return '"%s"' % str
    return 'NULL'

def from_db_string(db_str):
    if 'NULL' == db_str:
        return None
    return db_str[1:len(db_str)-2]  # Remove the outer quotes

class UserException(Exception):
    def __init__(self, message):
        self.message = message

class User:
    def __init__(self, id_or_name = None):
        if id_or_name:
            if is_int(id_or_name):
                where = 'WHERE id=%s' % id_or_name 
            else:
                where = 'WHERE username="%s"' % id_or_name
            query = 'SELECT id, username, password_hash, password_salt, email, home_directory, verified FROM users %s;' % where
            try:
                db = MySQLdb.connect(user='root', passwd='bitwise', db='file_browser')
                with db:
                    c = db.cursor(MySQLdb.cursors.DictCursor)
                    c.execute(query)
                    rows = c.fetchall()
                    if len(rows) == 0:
                        raise UserException('Unknown user %s' % id_or_name)
                    data = rows[0]
                    self.user_id = data["id"]
                    self.username = data["username"]
                    self.password_hash = data["password_hash"]
                    self.password_salt = data["password_salt"]
                    self.email = data["email"]
                    self.home_directory = data["home_directory"]
                    self.verified = data["verified"] != 0 
            except MySQLdb.Error, e:
                raise UserException('MySQL Error %d: %s' % e.args)
                 #raise UserException('User "%s" not found' % id_or_name)
    
    @staticmethod
    def create(username, password, email):
        # Ensure user does not yet exist
        try:
            user = User(username)
            raise UserException('User "%s" already exists!' % username)
        except:
            pass
        
        # Create the new user object.
        user = User()
        user.username = username
        user.email = email
        user.password_salt = uuid.uuid4().hex
        user.password_hash = hashlib.sha512(password + user.password_salt).hexdigest()
        user.home_directory = '/datastore/' + user.username
        user.verified = False
        
        # Create the new user in the database
        query = 'INSERT INTO users (username, password_hash, password_salt, email, home_directory, verified) VALUES ("%s", "%s", "%s", "%s", "%s", 1);' % (user.username, user.password_hash, user.password_salt, user.email, user.home_directory)
        try:
            db = MySQLdb.connect(user='root', passwd='bitwise', db='file_browser')
            with db:
                c = db.cursor()
                result = c.execute(query)
                
                c = db.cursor()
                result = c.execute('SELECT id FROM users WHERE username="%s"' % username)
                rows = c.fetchall()
                user.user_id = rows[0][0]
            
            return user
        except MySQLdb.Error, e:
            raise UserException('MySQL Error %d: %s' % e.args)
    
    def save(self):
        pass
    
    def authenticate(self, password):
        test_hash = hashlib.sha512(password + self.password_salt).hexdigest()
        return test_hash == self.password_hash
    
    def destroy(self):
        try:
            db = MySQLdb.connect(user='root', passwd='bitwise', db='file_browser')
            with db:
                c = db.cursor()
                result = c.execute('DELETE FROM users WHERE id=%d' % self.user_id)
        except MySQLdb.Error, e:
            raise UserException('MySQL Error %d: %s' % e.args)
    
    
def user_tests():
    try:
        # 1. C: Create a new user
        print 'Testing user CREATE'
        user = User.create('bob', 'pass123', 'bob@email.com')
    
        try:
        
            # 2. Test authenitcating the user
            print 'Testing user authentication'
            if user.authenticate('pass123'):
                print 'Success: Authenicated user "bob" with password "pass123"'
            else:
                print 'Error: Failed to authenicate user "bob" with password "pass123"'
            if not user.authenticate('pass567'):
                print 'Success: Failed to authenicate user "bob" with password "pass567"'
            else:
                print 'Error: Authenicated user "bob" with password "pass567"'
            
            # 3. R: Retrieve the used by id
            print 'Testing user RETRIEVAL by id'
            user2 = User(user.user_id)
            
            # 4. R: Retrieve the user by username
            print 'Testing user RETRIEVAL by name'
            user3 = User(user.username)
            
        finally:
        
            # 5. D: Destroy the user
            print 'Testing user DESTROY'
            user.destroy()
    except UserException, e:
        print 'User tests failed with exception "%s"' % e.message

if __name__ == '__main__':
    user_tests()