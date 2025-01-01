import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, DollarSign, Users } from "lucide-react";

const SalesAnalytics = () => {
  // Sample data - replace with real data from your backend
  const monthlyData = [
    { month: "Jan", sales: 2100 },
    { month: "Feb", sales: 3200 },
    { month: "Mar", sales: 2800 },
    { month: "Apr", sales: 4500 },
    { month: "May", sales: 3800 },
    { month: "Jun", sales: 5200 },
  ];

  const topSellingDecks = [
    { id: 1, name: "Spanish Basics", sales: 150, revenue: 1485 },
    { id: 2, name: "Advanced Physics", sales: 120, revenue: 2388 },
    { id: 3, name: "Web Development", sales: 95, revenue: 1425 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#2B4C7E]">Sales Analytics</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-[#2B4C7E]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2B4C7E]">$12,345</div>
            <p className="text-xs text-gray-500">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Package className="h-4 w-4 text-[#2B4C7E]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2B4C7E]">523</div>
            <p className="text-xs text-gray-500">+15% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Decks</CardTitle>
            <Package className="h-4 w-4 text-[#2B4C7E]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2B4C7E]">25</div>
            <p className="text-xs text-gray-500">+2 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-[#2B4C7E]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#2B4C7E]">412</div>
            <p className="text-xs text-gray-500">+38 new customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <div className="flex h-full items-end gap-2">
              {monthlyData.map((data, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-[#2B4C7E] rounded-t"
                    style={{
                      height: `${(data.sales / 6000) * 100}%`,
                      transition: "height 0.3s ease-in-out",
                    }}
                  />
                  <span className="text-sm text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Decks */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Decks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSellingDecks.map((deck) => (
              <div
                key={deck.id}
                className="flex items-center justify-between p-4 bg-[#F3F6FF] rounded-lg"
              >
                <div>
                  <h3 className="font-semibold text-[#2B4C7E]">{deck.name}</h3>
                  <p className="text-sm text-gray-500">{deck.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#2B4C7E]">
                    ${deck.revenue}
                  </p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesAnalytics;
