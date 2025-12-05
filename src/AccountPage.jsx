// src/AccountPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { signOut, getCurrentUser, updateUserProfile } from "@/lib/supabase";
import { getUserOrders } from "@/lib/orders";

const AccountPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    country: "",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User",
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();

      if (!user) {
        navigate("/login");
        return;
      }

      setCurrentUser(user);

      // Set user data
      setUserData({
        name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        country: user.country || "Philippines",
        avatar:
          user.avatar_url ||
          "https://api.dicebear.com/7.x/avataaars/svg?seed=" +
            (user.full_name || user.email),
      });

      // Load user's orders
      const userOrders = await getUserOrders(user.id);
      setOrders(userOrders || []);
    } catch (error) {
      console.error("Error loading user data:", error);
      alert("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);
      await updateUserProfile(currentUser.id, userData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600 mt-2">
                Manage your profile, orders, and preferences
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-24 w-24 mb-4 border-4 border-white">
                    <AvatarImage
                      src={userData.avatar}
                      alt={userData.name}
                      className="object-cover"
                    />
                    <AvatarFallback>
                      <User className="h-12 w-12 text-gray-600" />
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold text-gray-900">
                    {userData.name || "User"}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">{userData.email}</p>
                </div>

                <Separator className="my-4" />

                <nav className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid grid-cols-2 md:grid-cols-3 w-full bg-gray-100 p-1 rounded-lg">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-white"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="data-[state=active]:bg-white"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Orders
                </TabsTrigger>
                <TabsTrigger
                  value="tracking"
                  className="data-[state=active]:bg-white"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Tracking
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Personal Details</CardTitle>
                        <CardDescription>
                          Manage your personal information
                        </CardDescription>
                      </div>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        onClick={() =>
                          isEditing ? handleSave() : setIsEditing(true)
                        }
                        className="gap-2"
                        disabled={saving}
                      >
                        {isEditing ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            {saving ? "Saving..." : "Save Changes"}
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          Full Name
                        </Label>
                        {isEditing ? (
                          <Input
                            id="name"
                            name="name"
                            value={userData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            {userData.name || "Not set"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        {isEditing ? (
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={userData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            {userData.email}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          Phone Number
                        </Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            name="phone"
                            value={userData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter your phone number"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            {userData.phone || "Not set"}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="country"
                          className="flex items-center gap-2"
                        >
                          <Globe className="h-4 w-4" />
                          Country
                        </Label>
                        {isEditing ? (
                          <Input
                            id="country"
                            name="country"
                            value={userData.country}
                            onChange={handleInputChange}
                            placeholder="Enter your country"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border">
                            {userData.country || "Not set"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Address
                      </Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          name="address"
                          value={userData.address}
                          onChange={handleInputChange}
                          placeholder="Enter your address"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          {userData.address || "Not set"}
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {isEditing && (
                    <CardFooter className="flex justify-end space-x-3 border-t pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>Order History</CardTitle>
                      <CardDescription>
                        View and manage your orders
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">
                          No orders yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Start shopping to see your orders here
                        </p>
                        <Button onClick={() => navigate("/dashboard")}>
                          Start Shopping
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <Card
                            key={order.id}
                            className="hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg">
                                      {order.order_number}
                                    </h3>
                                    <Badge
                                      className={getStatusColor(order.status)}
                                    >
                                      <span className="flex items-center gap-1">
                                        {getStatusIcon(order.status)}
                                        {order.status.charAt(0).toUpperCase() +
                                          order.status.slice(1)}
                                      </span>
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600">Date</p>
                                      <p className="font-medium">
                                        {formatDate(order.created_at)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Items</p>
                                      <p className="font-medium">
                                        {order.order_items?.length || 0} items
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">
                                        Total Amount
                                      </p>
                                      <p className="font-medium text-green-600">
                                        P
                                        {parseFloat(order.total_amount).toFixed(
                                          2
                                        )}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Tracking</p>
                                      <p className="font-medium">
                                        {order.tracking_number ||
                                          "Not assigned"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() =>
                                      alert(
                                        `Order details for ${order.order_number}`
                                      )
                                    }
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Order Tracking Tab */}
              <TabsContent value="tracking">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Order Tracking
                    </CardTitle>
                    <CardDescription>
                      Track your orders in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-6 rounded-xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              Track Your Package
                            </h3>
                            <p className="text-gray-600">
                              Enter your tracking number to get updates
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter tracking number"
                              className="w-full md:w-64"
                              defaultValue="TRK-123456789"
                            />
                            <Button>Track</Button>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        {/* Tracking Timeline */}
                        <div className="space-y-8">
                          {[
                            {
                              status: "Order Placed",
                              time: "Jan 10, 2024 10:30 AM",
                              completed: true,
                            },
                            {
                              status: "Processing",
                              time: "Jan 10, 2024 11:45 AM",
                              completed: true,
                            },
                            {
                              status: "Shipped",
                              time: "Jan 11, 2024 09:15 AM",
                              completed: true,
                            },
                            {
                              status: "Out for Delivery",
                              time: "Jan 12, 2024 08:00 AM",
                              completed: false,
                            },
                            {
                              status: "Delivered",
                              time: "Estimated Jan 12, 2024",
                              completed: false,
                            },
                          ].map((step, index) => (
                            <div key={index} className="flex items-start gap-4">
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                                ${
                                  step.completed
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                              >
                                {step.completed ? (
                                  <CheckCircle className="h-5 w-5 text-white" />
                                ) : (
                                  <div className="w-3 h-3 bg-white rounded-full" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{step.status}</h4>
                                <p className="text-sm text-gray-600">
                                  {step.time}
                                </p>
                              </div>
                              {index < 4 && (
                                <div
                                  className={`absolute left-4 top-8 w-0.5 h-16 ${
                                    step.completed
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                  style={{ marginTop: "32px" }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
