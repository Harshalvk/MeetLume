"use client";

import React from "react";
import Logo from "../Logo";
import { Button } from "../ui/button";
import { signIn } from "@/lib/auth-client";

const Navbar = () => {
  return (
    <nav className="w-full border rounded-xl p-2 bg-primary/2 flex justify-between">
      <Logo />
      <div>
        <Button
          onClick={() => {
            signIn.social({
              provider: "google",
            });
          }}
          className="rounded-lg"
          size={"sm"}
          variant={"secondary"}
        >
          Login
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
