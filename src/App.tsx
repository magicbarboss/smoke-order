import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Dashboard from "./pages/Dashboard";
import BeveragesPage from "./pages/suppliers/BeveragesPage";
import SpiritsPage from "./pages/suppliers/SpiritsPage";
import FoodPage from "./pages/suppliers/FoodPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <main className="flex-1 flex flex-col">
              <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="flex h-14 items-center px-4">
                  <SidebarTrigger />
                  <div className="ml-4">
                    <h2 className="text-lg font-semibold">Bar Ordering System</h2>
                  </div>
                </div>
              </header>
              <div className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/beverages" element={<BeveragesPage />} />
                  <Route path="/spirits" element={<SpiritsPage />} />
                  <Route path="/food" element={<FoodPage />} />
                  <Route path="/cleaning" element={<div>Cleaning Supplies - Coming Soon</div>} />
                  <Route path="/masterclass" element={<div>Masterclass Supplies - Coming Soon</div>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
