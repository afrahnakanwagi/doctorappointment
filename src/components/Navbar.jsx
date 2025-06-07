import React from "react";
import Button from "../components/ui/Button";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-navbar shadow-md font-[Poppins]">
      <div className="flex items-center gap-2">
        <div className="text-icon text-3xl">❤️</div>
        <span className="text-xl font-bold text-button">MomCare</span>
      </div>
      <div className="flex gap-4">
        <Button variant="outline">Mom Login</Button>
        <Button>Doctor Login</Button>
      </div>
    </div>
  );
};

export default Navbar;