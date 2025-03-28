import React, { useEffect, useState } from "react";
import { MessageSquare, Heart } from "lucide-react";

function TrendingPosts() {
  const [posts, setPosts] = useState([]);

  const fetchPost = async () => {
    try {
      const response = await fetch("http://localhost:3000/posts?type=popular");
      const data = await response.json();
      console.log(data);

      setPosts(data);
    } catch (error) {
      console.error("Error fetching post:", error);
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Trending Posts</h2>
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center mb-4">
                <img
                  src={post.user.avatar}
                  alt={post.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {post.user.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{post.content}</p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="text-gray-400" size={20} />
                  <span className="text-gray-600">{post.commentCount}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="text-red-400" size={20} />
                  <span className="text-gray-600">{post.likeCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendingPosts;
