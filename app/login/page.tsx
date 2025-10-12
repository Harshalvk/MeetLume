"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signIn } from "@/lib/auth-client";
import { GitHub, Google } from "@/lib/icons";
import React from "react";

const LoginPage = () => {
  const handleSignInwithGoogle = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/user/my-projects",
    });
  };
  const handleSignInwithGitHub = async () => {
    await signIn.social({
      provider: "github",
      callbackURL: "/user/my-projects",
    });
  };

  return (
    <section className="w-full h-screen grid grid-cols-2 p-2 gap-2">
      <div className="col-span-1 bg-muted-foreground/5 hidden md:block rounded-2xl border">
        <div className="w-full h-full flex items-center justify-start p-4">
          <h1 className="text-6xl">
            Build for teams,
            <br /> powered by AI. <br />
            Meet smarter with{" "}
            <span className="underline underline-offset-8 text-5xl">
              Meetlume.
            </span>
          </h1>
        </div>
      </div>
      <div className="col-span-2 md:col-span-1">
        <div className="w-full h-full flex items-center justify-center">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Login to your account</CardTitle>
              <CardDescription>
                Let&apos;s get your project in front of the right eyes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button onClick={handleSignInwithGoogle} variant={"outline"}>
                Continue with Google <Google />
              </Button>
              <Button onClick={handleSignInwithGitHub} variant={"outline"}>
                Continue with Github <GitHub />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
