import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function Support() {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if (selectedTicket) {
            // Load messages for this ticket from the selected ticket object (or refetch if needed)
            // The serializer includes 'messages' array
            setMessages(selectedTicket.messages || []);
        }
    }, [selectedTicket]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchTickets = async () => {
        try {
            const res = await api.get('/support/tickets/');
            setTickets(res.data);
            if (res.data.length > 0) {
                // Auto-select the most recent ticket
                setSelectedTicket(res.data[0]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
            setLoading(false);
        }
    };

    const handleCreateTicket = async () => {
        const subject = prompt("Enter a subject for your support request (e.g., 'Appeal Flag'):");
        if (!subject) return;

        try {
            const res = await api.post('/support/tickets/', { subject });
            setTickets([res.data, ...tickets]);
            setSelectedTicket(res.data);
            setMessages([]);
        } catch (error) {
            alert("Failed to create ticket");
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        try {
            const res = await api.post(`/support/tickets/${selectedTicket.id}/message/`, {
                message: newMessage
            });
            // Update UI optimistically or refetch
            // For simplicity, let's append. But the backend returns "status: Message sent"
            // We should ideally reload the ticket to get the formatted message including sender
            // Or just manual append:
            const newMsgObj = {
                id: Date.now(),
                message: newMessage,
                sender: "Me", // Only used for UI logic if standardizing
                is_admin_reply: false,
                created_at: new Date().toISOString()
            };

            // Refetch to be safe and get consistent data
            const ticketRes = await api.get(`/support/tickets/${selectedTicket.id}/`);
            // NOTE: The Detail View might need to be implemented or we just use list.
            // Wait, ModelViewSet provides Retrieve.

            setMessages(ticketRes.data.messages);
            setNewMessage("");
        } catch (error) {
            alert("Failed to send message");
        }
    };

    if (loading) return <div className="p-8 text-center text-primary font-bold">Loading Support...</div>;

    return (
        <div className="container mx-auto px-6 py-8 h-[calc(100vh-100px)] flex flex-col">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Support & Appeals</h1>

            <div className="flex flex-1 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                {/* Sidebar - Ticket List */}
                <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-700">Your Tickets</h2>
                        <button
                            onClick={handleCreateTicket}
                            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition"
                        >
                            + New
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {tickets.length === 0 ? (
                            <p className="p-4 text-center text-gray-400 text-sm">No tickets yet.</p>
                        ) : (
                            tickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition hover:bg-gray-100 ${selectedTicket?.id === ticket.id ? 'bg-white border-l-4 border-l-indigo-500 shadow-sm' : ''}`}
                                >
                                    <h3 className="font-medium text-gray-800 text-sm truncate">{ticket.subject}</h3>
                                    <div className="flex justify-between mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${ticket.is_resolved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {ticket.is_resolved ? 'Resolved' : 'Open'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(ticket.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedTicket ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 bg-white">
                                <h3 className="font-bold text-gray-800">{selectedTicket.subject}</h3>
                                <p className="text-xs text-gray-500">
                                    Ticket #{selectedTicket.id} • {selectedTicket.is_resolved ? 'This conversation is closed.' : 'We typically reply within 24 hours.'}
                                </p>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                                {messages.length === 0 ? (
                                    <p className="text-center text-gray-400 text-sm mt-10">Start the conversation by explaining your issue.</p>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div
                                            key={msg.id || idx}
                                            className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}
                                        >
                                            <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm text-sm ${msg.is_admin_reply
                                                    ? 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                                    : 'bg-indigo-600 text-white rounded-tr-none'
                                                }`}>
                                                <p>{msg.message}</p>
                                                <div className={`text-[10px] mt-1 text-right ${msg.is_admin_reply ? 'text-gray-400' : 'text-indigo-200'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-white border-t border-gray-200">
                                <form onSubmit={handleSendMessage} className="flex gap-4">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        disabled={selectedTicket.is_resolved}
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || selectedTicket.is_resolved}
                                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
                                    >
                                        Send
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            <p>Select a ticket to view the conversation</p>
                            <button onClick={handleCreateTicket} className="mt-4 text-indigo-600 font-medium hover:underline">
                                or start a new appeal
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Support;
