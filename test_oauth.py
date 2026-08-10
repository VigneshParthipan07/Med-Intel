#!/usr/bin/env python3
"""
Test script to verify Google OAuth configuration
"""
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_oauth_config():
    """Test Google OAuth configuration"""
    
    client_id = os.environ.get("GOOGLE_OAUTH_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_OAUTH_CLIENT_SECRET")
    
    print("=== Google OAuth Configuration Test ===\n")
    
    # Check if credentials are set
    print("1. Checking environment variables:")
    print(f"   Client ID: {'✓ Set' if client_id else '✗ Missing'}")
    print(f"   Client Secret: {'✓ Set' if client_secret else '✗ Missing'}")
    
    if not client_id or not client_secret:
        print("\n❌ OAuth credentials are missing!")
        print("Please update your .env file with valid Google OAuth credentials.")
        return False
    
    print(f"   Client ID: {client_id}")
    print(f"   Client Secret: {client_secret[:10]}...")
    
    # Test Google's discovery document
    print("\n2. Testing Google Discovery URL:")
    try:
        discovery_url = "https://accounts.google.com/.well-known/openid-configuration"
        response = requests.get(discovery_url, timeout=10)
        if response.status_code == 200:
            print("   ✓ Google services are accessible")
            
            # Get authorization endpoint
            config = response.json()
            auth_endpoint = config.get("authorization_endpoint")
            print(f"   Authorization endpoint: {auth_endpoint}")
            
        else:
            print(f"   ✗ Failed to access Google services (Status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"   ✗ Error accessing Google services: {e}")
        return False
    
    # Test authorization URL generation
    print("\n3. Testing OAuth URL generation:")
    try:
        from oauthlib.oauth2 import WebApplicationClient
        
        redirect_uri = "http://localhost:5000/google_login/callback"
        client = WebApplicationClient(client_id)
        
        authorization_url = client.prepare_request_uri(
            auth_endpoint,
            redirect_uri=redirect_uri,
            scope=["openid", "email", "profile"],
        )
        
        print("   ✓ OAuth URL generated successfully")
        print(f"   Redirect URI: {redirect_uri}")
        print(f"   Auth URL: {authorization_url[:100]}...")
        
    except Exception as e:
        print(f"   ✗ Error generating OAuth URL: {e}")
        return False
    
    print("\n✅ Basic OAuth configuration appears to be working!")
    print("\nNext steps:")
    print("1. Make sure your OAuth consent screen is configured")
    print("2. Add your email to test users")
    print("3. Verify the redirect URI in Google Cloud Console exactly matches:")
    print(f"   {redirect_uri}")
    print("\n4. Try the Google login flow in your application")
    
    return True

if __name__ == "__main__":
    test_oauth_config()
