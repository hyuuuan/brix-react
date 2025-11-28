/**
 * My Attendance Page
 * Personal attendance records and statistics
 */

const MyAttendance = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">My Attendance</h3>
          <p className="text-gray-600">View your personal attendance history and records</p>
          <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
