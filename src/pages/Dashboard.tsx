import { SupplierCard } from "@/components/dashboard/SupplierCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { suppliers } from "@/data/suppliers";
import { Calendar, Clock, AlertTriangle, TrendingUp } from "lucide-react";

const supplierRoutes = [
  { id: "star-pubs", url: "/beverages" },
  { id: "st-austell", url: "/spirits" },
  { id: "salvo-charles", url: "/food" },
  { id: "cormack", url: "/cleaning" },
  { id: "masterclass", url: "/masterclass" },
];

export default function Dashboard() {
  // Mock data for demonstration
  const todayDate = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const upcomingDeadlines = [
    { supplier: "St Austell", deadline: "Sunday 12pm", hoursLeft: 36 },
    { supplier: "Salvo & Charles", deadline: "Sunday 12pm", hoursLeft: 36 },
    { supplier: "Star Pubs-Heineken", deadline: "Thursday 4pm", hoursLeft: 72 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Smoke & Mirrors</h1>
        <p className="text-muted-foreground">Bar Ordering System Dashboard</p>
        <p className="text-sm text-muted-foreground mt-1">{todayDate}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Draft orders pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Deadline</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">36h</div>
            <p className="text-xs text-muted-foreground">Sunday suppliers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£1,250</div>
            <p className="text-xs text-muted-foreground">Remaining this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingDeadlines.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <div className="font-medium">{item.supplier}</div>
                  <div className="text-sm text-muted-foreground">{item.deadline}</div>
                </div>
                <Badge variant={item.hoursLeft <= 24 ? "destructive" : "outline"}>
                  {item.hoursLeft}h left
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Supplier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => {
          const route = supplierRoutes.find(r => r.id === supplier.id);
          return (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              url={route?.url || "/"}
              pendingItems={Math.floor(Math.random() * 15)}
              draftTotal={Math.random() * 500}
            />
          );
        })}
      </div>
    </div>
  );
}