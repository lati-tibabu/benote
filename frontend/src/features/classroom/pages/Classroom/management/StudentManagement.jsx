// StudentManagement.jsx
import React, { useState } from 'react';

const StudentManagement = () => {
  const [students, setStudents] = useState([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ]);

  return (
    <div>
      <h2>Student Management</h2>
      <ul>
        {students.map((student) => (
          <li key={student.id}>{student.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default StudentManagement;