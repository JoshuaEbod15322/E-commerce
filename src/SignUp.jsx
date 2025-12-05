// src/SignUp.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signUp } from "@/lib/supabase";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    country: "Philippines",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await signUp(formData.email, formData.password, formData.username);

      setSuccess(
        "Account created successfully! Please check your email to confirm your account."
      );

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Sign up error:", error);
      setError(error.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSelectChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      country: value,
    }));
  };

  const countries = [
    "Philippines",
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "India",
    "China",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-800 p-4">
      <Card className="w-full max-w-md border border-neutral-600 bg-neutral-700 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Sign up
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Create your account
          </CardDescription>
        </CardHeader>

        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm text-center">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-neutral-300 font-medium"
              >
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="h-11 border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

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
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-neutral-300 font-medium"
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="h-11 border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isLoading}
              />
              <p className="text-xs text-neutral-400">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-neutral-300 font-medium">
                Address
              </Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter your address"
                className="h-11 border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500"
                value={formData.address}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-neutral-300 font-medium">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                className="h-11 border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            {/* Country Field */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-neutral-300 font-medium">
                Country
              </Label>
              <Select
                value={formData.country}
                onValueChange={handleSelectChange}
                disabled={isLoading}
              >
                <SelectTrigger className="h-11 w-full border-neutral-600 bg-neutral-800 text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:ring-neutral-500">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="border-neutral-600 bg-neutral-800">
                  {countries.map((country) => (
                    <SelectItem
                      key={country}
                      value={country}
                      className="text-white hover:bg-neutral-700 focus:bg-neutral-700"
                    >
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-4">
            {/* Sign Up Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium bg-neutral-600 text-white hover:bg-neutral-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            {/* Sign in link */}
            <div className="text-center">
              <span className="text-neutral-400 text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-neutral-300 hover:text-white hover:underline no-underline hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </button>
              </span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUpForm;
