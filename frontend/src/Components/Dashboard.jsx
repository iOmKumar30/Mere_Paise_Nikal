import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TopHeader({ username, image }) {
  const userInitial = username ? username.charAt(0).toUpperCase() : "";
  const navigate = useNavigate();
  return (
    <div className="flex justify-between items-center border-b border-gray-300 pb-4">
      <h1 className="text-2xl font-bold text-gray-800">Payments App</h1>
      <div className="flex gap-3 items-center">
        <div className="flex gap-3 items-center">
          <span className="text-gray-600 font-semibold">Hello {username}</span>
          {image ? (
            <img src={image} alt="profile" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center font-bold">
              {userInitial}
            </div>
          )}
        </div>
        <button
          type="button"
          className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
            navigate("/signin");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function Balance({ balance }) {
  return (
    <div className="flex gap-3 items-center border-b border-gray-300 pb-4 pt-3">
      <h1 className="text-2xl font-bold text-gray-800">Balance</h1>
      <h1 className="text-2xl font-bold text-gray-800">${balance}</h1>
    </div>
  );
}

export function Button({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2"
    >
      {label}
    </button>
  );
}

function UserList({ users = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const searchInputRef = useRef();
  useEffect(() => {
    // to ensure the search bar gets focus after the component mounts
    const focusTimeout = setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100); 

    return () => clearTimeout(focusTimeout);
  }, []);

  const filteredUsers = users
    .filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .slice(0, 8);

  return (
    <div>
      <h1 className="p-2 font-bold text-3xl">User List</h1>
      <input
        type="text"
        placeholder="Search Users"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoComplete="on"
        className="p-2 mb-4 border-black rounded-lg w-full"
        style={{ border: "1px solid black" }}
        ref={ searchInputRef }
      />
      {filteredUsers.map((user) => (
        <div key={user.id} className="flex justify-between pt-2">
          <div className="flex">
            <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
              <div className="flex flex-col justify-center h-full text-xl">
                {user.firstName[0]}
              </div>
            </div>
            <div className="flex flex-col justify-center h-full">
              <div>
                {user.firstName} {user.lastName}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center h-full">
            <Button
              label={"Send Money"}
              onClick={(e) => {
                e.preventDefault();
                navigate("/send", { state: { user } });
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const [users, setUsers] = useState([]);
  const [balance, setBalance] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/signin");
      return;
    }
    setUser(storedUser);

    const getUsers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/user/bulk"
        );
        const data = response.data.users;

        const filteredUsers = Array.isArray(data)
          ? data.filter((u) => u._id !== storedUser.id)
          : [];
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };

    const getBalance = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/v1/account/balance",
          {
            headers: { Authorization: `Bearer ${storedUser.token}` },
          }
        );
        setBalance(response.data.balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(0);
      }
    };

    getUsers();
    getBalance();
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="p-3 mt-1">
      <TopHeader username={user.name} />
      <Balance balance={balance} />
      <UserList users={users} />
    </div>
  );
}
