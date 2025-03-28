import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Users, TrendingUp } from "lucide-react";

function Navigation() {
  const navItems = [
    { path: "/", icon: Home, label: "Feed" },
    { path: "/top-users", icon: Users, label: "Top Users" },
    { path: "/trending", icon: TrendingUp, label: "Trending" },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-indigo-600">
              Social Analytics
            </h1>
          </div>
          <div className="flex space-x-8">
            {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center space-x-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-indigo-600"
                      : "text-gray-500 hover:text-indigo-600"
                  }`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
