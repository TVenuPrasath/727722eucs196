import React, { useEffect, useState } from "react";
import { MessageSquare, Heart, Share2 } from "lucide-react";

function Feed() {
  const [posts, setPosts] = useState([]);

  const fetchPost = async () => {
    try {
      const response = await fetch("http://localhost:3000/posts?type=latest");
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
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center mb-4">
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
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                    <Heart size={20} />
                    <span>{post.likeCount}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
                    <MessageSquare size={20} />
                    <span>{post.commentCount}</span>
                  </button>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;
