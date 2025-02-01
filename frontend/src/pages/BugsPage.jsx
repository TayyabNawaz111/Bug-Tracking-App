import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/config";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

function BugsPage() {
  const [tickets, setTickets] = useState([]);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [comments, setComments] = useState({});

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/tickets`, {
          headers: { Authorization: `Bearer ${token}` },
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
      await axios.put(
        `${API_URL}/tickets/${ticketId}/updateStatus`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
        )
      );
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const toggleComments = async (ticketId) => {
    if (expandedTicket === ticketId) {
      setExpandedTicket(null);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/comments/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setComments((prev) => ({ ...prev, [ticketId]: response.data }));
      setExpandedTicket(ticketId);
    } catch (error) {
      console.error("Error fetching comments:", error);
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
            <td className="py-2 px-4 border-b">Expand Comments</td>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <React.Fragment key={ticket.id}>
              <tr className="hover:bg-gray-100 transition duration-300">
                <td className="py-2 px-4 border-b">{ticket.id}</td>
                <td className="py-2 px-4 border-b">{ticket.title}</td>
                <td className="py-2 px-4 border-b">{ticket.description}</td>

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

                {/* Arrow button for toggling comments */}
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => toggleComments(ticket.id)}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    {expandedTicket === ticket.id ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </button>
                </td>
              </tr>

              {/* Comments section (only visible if expanded) */}
              {expandedTicket === ticket.id && (
                <tr>
                  <td colSpan="6" className="p-4 bg-gray-50 border-t">
                    <h2 className="text-lg font-semibold mb-3">Comments</h2>
                    {comments[ticket.id]?.length > 0 ? (
                      <ul className="space-y-4">
                        {comments[ticket.id].map((comment) => (
                          <li
                            key={comment.id}
                            className="p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                          >
                            <p className="text-sm text-gray-700">
                              {comment.content}
                            </p>
                            {comment.fileUrl && (
                              <a
                                href={`http://localhost:8000${comment.fileUrl}`}
                                className="mt-2 inline-block text-blue-500 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                Download File
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No comments available.</p>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BugsPage;
