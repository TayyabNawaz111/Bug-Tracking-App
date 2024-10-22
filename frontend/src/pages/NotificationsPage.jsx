import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/config'; // Adjust the import according to your project structure

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  // Fetch notifications when the component mounts
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/notifications`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Use JWT token for authentication
          },
        });
        setNotifications(response.data); // Set fetched notifications to state
      } catch (err) {
        setError("Error fetching notifications");
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Notifications</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {notifications.length === 0 && !error && (
        <p className="text-gray-600 text-center">No notifications available.</p>
      )}

      {notifications.length > 0 && (
        <ul className="grid grid-cols-1 gap-6">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="bg-white shadow-md rounded-lg p-6 transition duration-300 transform hover:scale-105"
            >
              <h5 className="text-xl font-semibold mb-2 text-gray-800">
                {notification.title}
              </h5>
              <p className="text-gray-600">{notification.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationsPage;
