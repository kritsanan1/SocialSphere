# Example Code: Ayrshare API Integration for Content Management System

import requests
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import os

class AyrshareAPI:
    """
    Ayrshare API wrapper class for social media management
    """
    
    def __init__(self, api_key: str, profile_key: Optional[str] = None):
        """
        Initialize Ayrshare API client
        
        Args:
            api_key (str): Your Ayrshare API key
            profile_key (str, optional): Profile key for Business/Enterprise plans
        """
        self.api_key = api_key
        self.profile_key = profile_key
        self.base_url = "https://api.ayrshare.com/api"
        
        # Set up headers
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept-Encoding": "deflate, gzip, br"
        }
        
        # Add profile key if provided (for Business/Enterprise plans)
        if profile_key:
            self.headers["Profile-Key"] = profile_key
    
    def post_content(self, post_data: Dict) -> Dict:
        """
        Post content to social media platforms
        
        Args:
            post_data (dict): Post data containing content and platform information
            
        Returns:
            dict: API response
        """
        endpoint = f"{self.base_url}/post"
        
        try:
            response = requests.post(endpoint, json=post_data, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "status": "failed"}
    
    def schedule_post(self, post_data: Dict, schedule_time: str) -> Dict:
        """
        Schedule a post for future publishing
        
        Args:
            post_data (dict): Post data
            schedule_time (str): ISO format datetime string
            
        Returns:
            dict: API response
        """
        post_data["scheduleDate"] = schedule_time
        return self.post_content(post_data)
    
    def get_analytics(self, post_id: str = None, platform: str = None) -> Dict:
        """
        Get analytics for posts
        
        Args:
            post_id (str, optional): Specific post ID
            platform (str, optional): Specific platform
            
        Returns:
            dict: Analytics data
        """
        endpoint = f"{self.base_url}/analytics"
        params = {}
        
        if post_id:
            params["id"] = post_id
        if platform:
            params["platform"] = platform
            
        try:
            response = requests.get(endpoint, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "status": "failed"}
    
    def get_post_history(self, last_days: int = 30) -> Dict:
        """
        Get post history
        
        Args:
            last_days (int): Number of days to look back
            
        Returns:
            dict: Post history data
        """
        endpoint = f"{self.base_url}/history"
        params = {"lastDays": last_days}
        
        try:
            response = requests.get(endpoint, headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "status": "failed"}
    
    def delete_post(self, post_id: str, platform: str) -> Dict:
        """
        Delete a post from a platform
        
        Args:
            post_id (str): Post ID to delete
            platform (str): Platform name
            
        Returns:
            dict: API response
        """
        endpoint = f"{self.base_url}/delete"
        delete_data = {
            "id": post_id,
            "platform": platform
        }
        
        try:
            response = requests.delete(endpoint, json=delete_data, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "status": "failed"}
    
    def upload_media(self, file_path: str) -> Dict:
        """
        Upload media file to Ayrshare media library
        
        Args:
            file_path (str): Path to media file
            
        Returns:
            dict: Upload response with media URL
        """
        endpoint = f"{self.base_url}/upload"
        
        try:
            with open(file_path, 'rb') as file:
                files = {'file': file}
                # Remove Content-Type header for file upload
                upload_headers = {k: v for k, v in self.headers.items() if k != "Content-Type"}
                
                response = requests.post(endpoint, files=files, headers=upload_headers)
                response.raise_for_status()
                return response.json()
        except (requests.exceptions.RequestException, FileNotFoundError) as e:
            return {"error": str(e), "status": "failed"}

class ContentManager:
    """
    Content Management System class that integrates with Ayrshare
    """
    
    def __init__(self, ayrshare_api: AyrshareAPI):
        self.ayrshare = ayrshare_api
        self.supported_platforms = [
            "facebook", "instagram", "linkedin", "x", "tiktok", 
            "youtube", "pinterest", "reddit", "telegram", "threads",
            "snapchat", "bluesky", "google_business"
        ]
    
    def create_post(self, content: str, platforms: List[str], 
                   media_urls: List[str] = None, schedule_time: str = None,
                   hashtags: List[str] = None) -> Dict:
        """
        Create and publish/schedule a social media post
        
        Args:
            content (str): Post content/text
            platforms (list): List of platforms to post to
            media_urls (list, optional): List of media URLs
            schedule_time (str, optional): ISO datetime string for scheduling
            hashtags (list, optional): List of hashtags to include
            
        Returns:
            dict: Post creation result
        """
        
        # Validate platforms
        invalid_platforms = [p for p in platforms if p not in self.supported_platforms]
        if invalid_platforms:
            return {
                "error": f"Unsupported platforms: {invalid_platforms}",
                "status": "failed"
            }
        
        # Prepare post data
        post_data = {
            "post": content,
            "platforms": platforms
        }
        
        # Add media if provided
        if media_urls:
            post_data["mediaUrls"] = media_urls
        
        # Add hashtags if provided
        if hashtags:
            hashtag_string = " ".join([f"#{tag.lstrip('#')}" for tag in hashtags])
            post_data["post"] += f" {hashtag_string}"
        
        # Schedule or post immediately
        if schedule_time:
            return self.ayrshare.schedule_post(post_data, schedule_time)
        else:
            return self.ayrshare.post_content(post_data)
    
    def bulk_post(self, posts: List[Dict]) -> List[Dict]:
        """
        Create multiple posts in bulk
        
        Args:
            posts (list): List of post dictionaries
            
        Returns:
            list: List of results for each post
        """
        results = []
        
        for post in posts:
            result = self.create_post(
                content=post.get("content", ""),
                platforms=post.get("platforms", []),
                media_urls=post.get("media_urls"),
                schedule_time=post.get("schedule_time"),
                hashtags=post.get("hashtags")
            )
            results.append(result)
        
        return results
    
    def get_content_analytics(self, days: int = 7) -> Dict:
        """
        Get analytics for recent content
        
        Args:
            days (int): Number of days to analyze
            
        Returns:
            dict: Analytics summary
        """
        history = self.ayrshare.get_post_history(days)
        
        if "error" in history:
            return history
        
        # Process analytics data
        analytics_summary = {
            "total_posts": 0,
            "total_engagement": 0,
            "platform_breakdown": {},
            "top_performing_posts": []
        }
        
        if "posts" in history:
            posts = history["posts"]
            analytics_summary["total_posts"] = len(posts)
            
            for post in posts:
                platform = post.get("platform", "unknown")
                engagement = post.get("likes", 0) + post.get("shares", 0) + post.get("comments", 0)
                
                analytics_summary["total_engagement"] += engagement
                
                if platform not in analytics_summary["platform_breakdown"]:
                    analytics_summary["platform_breakdown"][platform] = {
                        "posts": 0,
                        "engagement": 0
                    }
                
                analytics_summary["platform_breakdown"][platform]["posts"] += 1
                analytics_summary["platform_breakdown"][platform]["engagement"] += engagement
        
        return analytics_summary

# Example usage and Flask integration
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Initialize Ayrshare API (get API key from environment)
API_KEY = os.getenv("AYRSHARE_API_KEY")
if not API_KEY:
    raise ValueError("AYRSHARE_API_KEY environment variable is required")

ayrshare_api = AyrshareAPI(API_KEY)
content_manager = ContentManager(ayrshare_api)

@app.route("/api/post", methods=["POST"])
def create_post():
    """API endpoint to create a new social media post"""
    try:
        data = request.get_json()
        
        result = content_manager.create_post(
            content=data.get("content", ""),
            platforms=data.get("platforms", []),
            media_urls=data.get("media_urls"),
            schedule_time=data.get("schedule_time"),
            hashtags=data.get("hashtags")
        )
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e), "status": "failed"}), 500

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    """API endpoint to get content analytics"""
    try:
        days = request.args.get("days", 7, type=int)
        analytics = content_manager.get_content_analytics(days)
        return jsonify(analytics)
    
    except Exception as e:
        return jsonify({"error": str(e), "status": "failed"}), 500

@app.route("/api/history", methods=["GET"])
def get_history():
    """API endpoint to get post history"""
    try:
        days = request.args.get("days", 30, type=int)
        history = ayrshare_api.get_post_history(days)
        return jsonify(history)
    
    except Exception as e:
        return jsonify({"error": str(e), "status": "failed"}), 500

@app.route("/api/upload", methods=["POST"])
def upload_media():
    """API endpoint to upload media files"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided", "status": "failed"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected", "status": "failed"}), 400
        
        # Save file temporarily
        temp_path = f"/tmp/{file.filename}"
        file.save(temp_path)
        
        # Upload to Ayrshare
        result = ayrshare_api.upload_media(temp_path)
        
        # Clean up temporary file
        os.remove(temp_path)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e), "status": "failed"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

# Example usage script
def example_usage():
    """Example of how to use the ContentManager class"""
    
    # Initialize with your API key
    api_key = "YOUR_AYRSHARE_API_KEY"
    ayrshare = AyrshareAPI(api_key)
    cms = ContentManager(ayrshare)
    
    # Create a simple post
    result = cms.create_post(
        content="Hello from our content management system! 🚀",
        platforms=["facebook", "x", "linkedin"],
        hashtags=["contentmanagement", "socialmedia", "automation"]
    )
    print("Post result:", result)
    
    # Schedule a post for tomorrow
    tomorrow = (datetime.now() + timedelta(days=1)).isoformat()
    scheduled_result = cms.create_post(
        content="Scheduled post for tomorrow!",
        platforms=["instagram", "facebook"],
        schedule_time=tomorrow
    )
    print("Scheduled post result:", scheduled_result)
    
    # Get analytics
    analytics = cms.get_content_analytics(days=7)
    print("Analytics:", analytics)
    
    # Bulk post example
    bulk_posts = [
        {
            "content": "First bulk post",
            "platforms": ["facebook", "x"],
            "hashtags": ["bulk", "posting"]
        },
        {
            "content": "Second bulk post",
            "platforms": ["linkedin", "instagram"],
            "hashtags": ["automation", "cms"]
        }
    ]
    
    bulk_results = cms.bulk_post(bulk_posts)
    print("Bulk post results:", bulk_results)

# Uncomment to run example
# example_usage()

