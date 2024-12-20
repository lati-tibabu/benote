import React from "react";

function Home() {
  return (
    <div>
      Home
      <h1>Welcome to your workspace</h1>
      <p>
        Create your workspace and start managing your tasks, collaborating with
        classmates, and improving your study habits with ease.
      </p>
      <form>
        <label htmlFor="workspaceName">Workspace Name:</label>
        <input type="text" id="workspaceName" name="workspaceName" required />

        <label htmlFor="description">Description:</label>
        <textarea id="description" name="description"></textarea>

        {/* Add more fields as needed */}
        <button>Create Workspace</button>
      </form>
    </div>
  );
}

export default Home;
