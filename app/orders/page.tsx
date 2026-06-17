import DashboardLayout from "@/components/layout/DashboardLayout";

export default function OrdersPage() {
    return (
        <DashboardLayout>
            <div className="p-8">
                <h1 className="text-3xl font-bold">Orders</h1>

                <div className="mt-6 border rounded-lg p-4">
                    <p>Reliance Trends</p>
                    <p>Men's Formal Shirt</p>
                    <p>1200 pcs</p>
                </div>

                <div className="mt-4 border rounded-lg p-4">
                    <p>Fabindia Export</p>
                    <p>Women's Kurti</p>
                    <p>850 pcs</p>
                </div>
            </div>
        </DashboardLayout>
    );
}