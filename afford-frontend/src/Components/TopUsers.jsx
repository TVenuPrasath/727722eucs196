import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

function TopUsers() {
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/users");
      const data = await response.json();
      console.log(data);

      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center space-x-2 mb-8">
        <Trophy className="text-yellow-500" size={24} />
        <h2 className="text-2xl font-bold text-gray-900">Top Users</h2>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {users.map((user, index) => (
          <div
            key={user.id}
            className="flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 mr-4">
              <div className="relative">
                <div className="absolute -top-1 -right-1 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.postCount} posts</p>
            </div>
            <div className="flex-shrink-0">
              <div className="text-sm font-medium text-indigo-600">
                View Profile
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopUsers;
