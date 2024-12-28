import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";

const Users = () => {
  const apiURL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("jwt");
  const header = {
    authorization: `Bearer ${token}`,
  };

  const [users, setUsers] = useState([]);
  const [loadUser, setLoadUser] = useState(false);

  const getUsers = async () => {
    try {
      const response = await fetch(`${apiURL}/api/users`, {
        method: "GET",
      });
      const data = await response.json();
      if (response) {
        setUsers(data);
      } else {
        console.log("No users found");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getUsers();
  }, [loadUser]);
  console.log("Users list: ", users);

  const handleDeleteUser = async (id) => {
    // alert(`User with ID ${id} is being deleted`);
    if (window.confirm("Sure wanna delete user?")) {
      try {
        const response = await fetch(`${apiURL}/api/users/${id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          alert(`User is deleted`);
        } else {
          alert(`User deletion is failed`);
        }
      } catch (error) {
        console.error("Error deleting user ", error);
        alert("User deletion error");
      }
    }

    setLoadUser(!loadUser);
  };

  return (
    <div>
      <h1>Users</h1>
      <div className="overflow-x-auto">
        <table className="table table-xs">
          <thead>
            <tr className="text-black">
              <th></th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => (
                <tr>
                  <th>{index + 1}</th>
                  <td>{user.id.slice(0, 5) + "..."}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    {new Date(user.createdAt).toLocaleString().split(",")[0]}
                  </td>
                  <td>{new Date(user.updatedAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn btn-success text-white flex flex-row"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <AiFillDelete />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>No users in the system</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="text-black">
              <th></th>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Action</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Users;
