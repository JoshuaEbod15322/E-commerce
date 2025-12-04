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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
    phone: "",
    country: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Sign up attempt with:", formData);
      setIsLoading(false);
      alert(`Account created for: ${formData.username}`);
    }, 1000);
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
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "India",
    "China",
    "Philippines",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-800 p-4">
      <Card className="w-full max-w-md border border-neutral-600 bg-neutral-700 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-white">
            Sign up
          </CardTitle>
          <CardDescription className="text-neutral-400">
            Create your account.
          </CardDescription>
        </CardHeader>

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
                disabled={isLoading}
              />
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
                <Link
                  to="/login"
                  className="font-medium text-neutral-300 hover:text-white hover:underline no-underline hover:underline"
                >
                  Sign in
                </Link>
              </span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUpForm;
