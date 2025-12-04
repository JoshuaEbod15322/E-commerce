import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Import your image
import desktopImage from "./assets/logo.png";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Login attempt with:", { email, password });
      setIsLoading(false);
      alert(`Logged in as: ${email}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-neutral-800">
      {/* Left Side - Image (hidden on mobile, shown on lg screens) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-4 lg:p-8">
        <div className="max-w-2xl w-full">
          <img
            src={desktopImage}
            alt="Login Illustration"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <Card className="w-full max-w-md border border-neutral-600 bg-neutral-700 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Login
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-neutral-300 font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-neutral-300 font-medium"
                  >
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-sm text-neutral-400 hover:text-neutral-300 hover:underline no-underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="h-11 border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-[10px]">
              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-neutral-600 text-white hover:bg-neutral-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              {/* Sign up section */}
              <div className="w-full text-left">
                <span className="text-neutral-400 text-sm">
                  You don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-neutral-300 hover:text-white hover:underline no-underline hover:underline"
                  >
                    Sign up
                  </Link>
                </span>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
