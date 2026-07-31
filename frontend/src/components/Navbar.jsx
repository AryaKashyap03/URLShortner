import { useState } from "react";
import close from "../assets/close.png";
import more from "../assets/more.png";

const Navbar = ({loggedIn, setLoggedIn}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {!menuOpen && (
        <nav className="flex justify-between p-3 bg-amber-200 ">
          <h1 className="text-3xl font-bold my-auto">URL Shortner</h1>
          <ul className="hidden sm:flex gap-5 my-auto">
            <li>
              <a href="/" className="cursor-pointer">
                Home
              </a>
            </li>
            {loggedIn ? (
              <button
                className="bg-red-500 text-white px-2 rounded"
                onClick={() => {
                  localStorage.removeItem("token");
                  setLoggedIn(false);
                  setMenuOpen(false);
                }}
              >
                Logout
              </button>
            ) : null}
          </ul>
          <img
            src={more}
            alt="menu icon"
            className="sm:hidden h-4 w-auto my-auto"
            onClick={() => setMenuOpen(true)}
          />
        </nav>
      )}
      {menuOpen && (
        <div className="flex flex-col gap-2 bg-amber-200 h-screen p-5 fixed z-50 inset-0">
          <img
            src={close}
            alt="close icon"
            className="w-4 justify-items-start"
            onClick={() => setMenuOpen(false)}
          />
          <ul className="flex flex-col">
            <li>
              <a href="/" className="cursor-pointer">
                Home
              </a>
            </li>
            {loggedIn ? (
              <button
                className="bg-red-500 text-white px-2 rounded"
                onClick={() => {
                  localStorage.removeItem("token");
                  setMenuOpen(false);
                  setLoggedIn(false);
                }}
              >
                Logout
              </button>
            ) : null}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;
