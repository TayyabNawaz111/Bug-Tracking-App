import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/config";

function BugsPage() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTickets(response.data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, []);

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      // Make the API request to update the status
      await axios.put(
        `${API_URL}/tickets/${ticketId}/updateStatus`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state to reflect the change
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bugs Page</h1>
      <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200 text-gray-600 uppercase text-sm font-bold">
            <td className="py-2 px-4 border-b">ID</td>
            <td className="py-2 px-4 border-b">Title</td>
            <td className="py-2 px-4 border-b">Description</td>
            <td className="py-2 px-4 border-b">Status</td>
            <td className="py-2 px-4 border-b">Severity</td>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-gray-100 transition duration-300"
            >
              <td className="py-2 px-4 border-b">{ticket.id}</td>
              <td className="py-2 px-4 border-b">{ticket.title}</td>
              <td className="py-2 px-4 border-b">{ticket.description}</td>

              {/* Conditionally render dropdown based on the status */}
              <td className="py-2 px-4 border-b">
                {ticket.status === "Closed" ? (
                  <span className="text-gray-500">Closed</span>
                ) : (
                  <select
                    value={ticket.status}
                    onChange={(e) =>
                      handleStatusChange(ticket.id, e.target.value)
                    }
                    className="border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                )}
              </td>

              <td className="py-2 px-4 border-b">{ticket.severity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BugsPage;
