import { useState } from "react";

const LogsDisplay = ({ logs }) => {
  const [showLogs, setShowLogs] = useState(false);
  const [expandedLogIds, setExpandedLogIds] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6); // Number of logs to show initially

  const toggleExpand = (id) => {
    setExpandedLogIds((prev) =>
      prev.includes(id) ? prev.filter((logId) => logId !== id) : [...prev, id]
    );
  };

  const loadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-6 h-6 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 3h14v2H3V3zm0 4h14v2H3V7zm0 4h10v2H3v-2z" />
          </svg>
          Program Logs
        </h2>
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="text-sm bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition"
        >
          {showLogs ? "Hide Logs" : "Show Logs"}
        </button>
      </div>

      {showLogs && (
        <>
          {logs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {logs.slice(0, visibleCount).map((log) => (
                <div key={log.id} className="bg-white border rounded-xl p-4 shadow hover:shadow-md transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-700">#{log.id} — {log.action}</p>
                      <p className="text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="text-sm text-teal-600 hover:underline"
                    >
                      {expandedLogIds.includes(log.id) ? "Hide" : "View"}
                    </button>
                  </div>

                  {expandedLogIds.includes(log.id) && (
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      {/* <p><span className="font-medium">User ID:</span> {log.userId}</p> */}
                      {/* <p><span className="font-medium">Program ID:</span> {log.programId}</p> */}
                      <p><span className="font-medium">Details:</span> {log.details}</p>
                      <p className="text-xs text-gray-400">
                        <span className="font-medium">Updated:</span> {new Date(log.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No logs found for this program.</p>
          )}

          {logs.length > visibleCount && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow hover:bg-teal-700 transition"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LogsDisplay;
