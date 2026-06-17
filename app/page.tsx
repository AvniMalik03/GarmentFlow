import DashboardLayout from "@/components/layout/DashboardLayout";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold">
          Garment Production Tracking System
        </h1>

        <p className="mt-4">
          Welcome to the dashboard.
        </p>
      </div>
    </DashboardLayout>
  );
}
