import React from 'react';

export type ReviewerAssignmentProps = {
  theme?: 'light' | 'dark';
};

const ReviewerAssignment: React.FC<ReviewerAssignmentProps> = ({ theme = 'light' }) => {
  const isDark = theme === 'dark';
  return (
    <div
      className={
        isDark
          ? 'bg-gray-800 border border-gray-700 rounded-lg p-6 text-gray-100'
          : 'bg-white border border-gray-200 rounded-lg p-6 text-gray-900'
      }
    >
      <h2 className="text-xl font-semibold mb-2">Assignments</h2>
      <p className={isDark ? 'text-gray-300 text-sm' : 'text-gray-600 text-sm'}>
        Assignment management is coming soon. You will be able to assign code reviews to team members and track progress here.
      </p>
    </div>
  );
};

export { ReviewerAssignment };
export default ReviewerAssignment;


