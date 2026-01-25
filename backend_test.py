import requests
import sys
from datetime import datetime
import json

class MitteieAPITester:
    def __init__(self, base_url="https://oversikt.preview.emergentagent.com"):
        self.base_url = base_url
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, session=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            # Use session if provided, otherwise create new request
            if session:
                if method == 'GET':
                    response = session.get(url, headers=headers)
                elif method == 'POST':
                    response = session.post(url, json=data, headers=headers)
                elif method == 'PUT':
                    response = session.put(url, json=data, headers=headers)
                elif method == 'DELETE':
                    response = session.delete(url, headers=headers)
            else:
                if method == 'GET':
                    response = requests.get(url, headers=headers)
                elif method == 'POST':
                    response = requests.post(url, json=data, headers=headers)
                elif method == 'PUT':
                    response = requests.put(url, json=data, headers=headers)
                elif method == 'DELETE':
                    response = requests.delete(url, headers=headers)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_test(name, True)
                    return True, response_data, response
                except:
                    self.log_test(name, True, "No JSON response")
                    return True, {}, response
            else:
                try:
                    error_data = response.json()
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}: {error_data}")
                except:
                    self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}")
                return False, {}, response

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}, None

    def test_signup(self, session):
        """Test user signup"""
        test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        signup_data = {
            "email": test_email,
            "password": "TestPass123!",
            "name": "Test Bruker"
        }
        
        success, response, resp_obj = self.run_test(
            "User Signup",
            "POST",
            "auth/signup",
            200,
            data=signup_data,
            session=session
        )
        
        if success and 'user_id' in response:
            self.user_id = response['user_id']
            print(f"   Created user: {self.user_id}")
            return True, test_email, "TestPass123!"
        return False, None, None

    def test_login(self, email, password, session):
        """Test user login"""
        login_data = {
            "email": email,
            "password": password
        }
        
        success, response, resp_obj = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data,
            session=session
        )
        
        if success and 'user_id' in response:
            self.user_id = response['user_id']
            print(f"   Logged in user: {self.user_id}")
            return True
        return False

    def test_auth_me(self, session):
        """Test /auth/me endpoint"""
        success, response, resp_obj = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            session=session
        )
        return success

    def test_create_item(self, session):
        """Test creating an item"""
        item_data = {
            "navn": "Test Laptop",
            "kategori": "Elektronikk",
            "serienummer": "ABC123456",
            "notat": "MacBook Pro 2023",
            "verdi": 25000.0,
            "valuta": "NOK",
            "vedlegg_urls": []
        }
        
        success, response, resp_obj = self.run_test(
            "Create Item",
            "POST",
            "items",
            201,
            data=item_data,
            session=session
        )
        
        if success and 'item_id' in response:
            print(f"   Created item: {response['item_id']}")
            return True, response['item_id']
        return False, None

    def test_get_items(self, session):
        """Test getting all items"""
        success, response, resp_obj = self.run_test(
            "Get All Items",
            "GET",
            "items",
            200,
            session=session
        )
        
        if success:
            print(f"   Found {len(response)} items")
        return success, response if success else []

    def test_get_item(self, item_id, session):
        """Test getting a specific item"""
        success, response, resp_obj = self.run_test(
            "Get Specific Item",
            "GET",
            f"items/{item_id}",
            200,
            session=session
        )
        return success

    def test_update_item(self, item_id, session):
        """Test updating an item"""
        update_data = {
            "navn": "Updated Test Laptop",
            "verdi": 30000.0,
            "notat": "MacBook Pro 2023 - Updated"
        }
        
        success, response, resp_obj = self.run_test(
            "Update Item",
            "PUT",
            f"items/{item_id}",
            200,
            data=update_data,
            session=session
        )
        return success

    def test_delete_item(self, item_id, session):
        """Test deleting an item"""
        success, response, resp_obj = self.run_test(
            "Delete Item",
            "DELETE",
            f"items/{item_id}",
            200,
            session=session
        )
        return success

    def test_logout(self, session):
        """Test user logout"""
        success, response, resp_obj = self.run_test(
            "User Logout",
            "POST",
            "auth/logout",
            200,
            session=session
        )
        return success

    def test_cloudinary_signature(self, session):
        """Test Cloudinary signature generation"""
        success, response, resp_obj = self.run_test(
            "Cloudinary Signature",
            "GET",
            "cloudinary/signature",
            200,
            session=session
        )
        return success

def main():
    print("🚀 Starting MITTEIE Backend API Tests")
    print("=" * 50)
    
    tester = MitteieAPITester()
    
    # Create a session to maintain cookies
    session = requests.Session()
    
    # Test signup
    signup_success, email, password = tester.test_signup(session)
    if not signup_success:
        print("❌ Signup failed, stopping tests")
        return 1

    # Test login (should work with session cookie from signup)
    login_success = tester.test_login(email, password, session)
    if not login_success:
        print("❌ Login failed, stopping tests")
        return 1
    
    # Test authenticated endpoints
    tester.test_auth_me(session)
    
    # Test item CRUD operations
    create_success, item_id = tester.test_create_item(session)
    if create_success and item_id:
        tester.test_get_item(item_id, session)
        tester.test_update_item(item_id, session)
        
        # Test getting all items
        tester.test_get_items(session)
        
        # Test delete (do this last)
        tester.test_delete_item(item_id, session)

    # Test Cloudinary signature (should work even if keys are empty)
    tester.test_cloudinary_signature(session)
    
    # Test logout
    tester.test_logout(session)

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        print("\nFailed tests:")
        for result in tester.test_results:
            if not result['success']:
                print(f"  - {result['name']}: {result['details']}")
        return 1

if __name__ == "__main__":
    sys.exit(main())