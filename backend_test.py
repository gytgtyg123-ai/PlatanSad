import requests
import sys
from datetime import datetime

class PlatanSadAPITester:
    def __init__(self, base_url="https://quick-launch-67.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.product_id = None
        self.cart_item_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}" if not endpoint.startswith('/') else f"{self.base_url}{endpoint}"
        
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)
        
        if self.admin_token:
            default_headers['Authorization'] = f'Bearer {self.admin_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.run_test("Get All Products", "GET", "products", 200)
        if success:
            products = response.get('products', []) if isinstance(response, dict) else response
            if isinstance(products, list) and len(products) > 0:
                self.product_id = products[0].get('id')
                print(f"   Found {len(products)} products")
                print(f"   First product ID: {self.product_id}")
            else:
                print(f"   Warning: Expected products list, got: {type(products)}")
        return success

    def test_get_categories(self):
        """Test getting all categories"""
        success, response = self.run_test("Get Categories", "GET", "categories", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} categories")
            for cat in response[:3]:  # Show first 3
                print(f"   - {cat.get('name', 'Unknown')}: {cat.get('count', 0)} products")
        return success

    def test_get_single_product(self):
        """Test getting a single product"""
        if not self.product_id:
            print("⚠️  Skipping single product test - no product ID available")
            return True
        
        return self.run_test(
            "Get Single Product", 
            "GET", 
            f"products/{self.product_id}", 
            200
        )[0]

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin token obtained")
            return True
        return False

    def test_admin_stats(self):
        """Test admin dashboard stats"""
        if not self.admin_token:
            print("⚠️  Skipping admin stats test - no admin token")
            return True
            
        success, response = self.run_test("Admin Stats", "GET", "admin/stats", 200)
        if success:
            print(f"   Products: {response.get('products', 'N/A')}")
            print(f"   Categories: {response.get('categories', 'N/A')}")
            print(f"   Orders: {response.get('orders', 'N/A')}")
        return success

    def test_add_to_cart(self):
        """Test adding product to cart"""
        if not self.product_id:
            print("⚠️  Skipping cart test - no product ID available")
            return True
            
        success, response = self.run_test(
            "Add to Cart",
            "POST", 
            "cart/add",
            200,
            data={"productId": self.product_id, "quantity": 1, "userId": "test-user"}
        )
        
        if success and 'id' in response:
            self.cart_item_id = response['id']
            print(f"   Cart item ID: {self.cart_item_id}")
        return success

    def test_get_cart(self):
        """Test getting cart contents"""
        return self.run_test("Get Cart", "GET", "cart?userId=test-user", 200)[0]

    def test_categories_with_products(self):
        """Test that categories have product counts"""
        success, response = self.run_test("Get Categories with Counts", "GET", "categories", 200)
        if success and isinstance(response, list):
            categories_with_products = [cat for cat in response if cat.get('count', 0) > 0]
            print(f"   Categories with products: {len(categories_with_products)}")
            return len(categories_with_products) >= 5  # Expect at least 5 categories with products
        return False

    def test_search_products(self):
        """Test product search"""
        success, response = self.run_test(
            "Search Products", 
            "GET", 
            "products?search=туя", 
            200
        )
        if success:
            products = response.get('products', []) if isinstance(response, dict) else response
            if isinstance(products, list):
                print(f"   Found {len(products)} products matching 'туя'")
                return len(products) > 0
        return success

    def test_filter_by_category(self):
        """Test filtering products by category"""
        success, response = self.run_test(
            "Filter by Category", 
            "GET", 
            "products?category=Туя Смарагд", 
            200
        )
        if success:
            products = response.get('products', []) if isinstance(response, dict) else response
            if isinstance(products, list):
                print(f"   Found {len(products)} products in 'Туя Смарагд' category")
        return success

def main():
    """Run all tests"""
    print("=" * 60)
    print("🌱 PlatanSad API Testing Suite")
    print("=" * 60)
    
    tester = PlatanSadAPITester()
    
    # Test sequence
    tests = [
        ("API Root", tester.test_api_root),
        ("Products API", tester.test_get_products),
        ("Categories API", tester.test_get_categories), 
        ("Single Product", tester.test_get_single_product),
        ("Categories with Products", tester.test_categories_with_products),
        ("Product Search", tester.test_search_products),
        ("Category Filter", tester.test_filter_by_category),
        ("Admin Login", tester.test_admin_login),
        ("Admin Stats", tester.test_admin_stats),
        ("Add to Cart", tester.test_add_to_cart),
        ("Get Cart", tester.test_get_cart),
    ]
    
    print("\n🚀 Starting tests...")
    
    failed_tests = []
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("\n✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())